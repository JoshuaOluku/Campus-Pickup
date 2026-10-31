import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'
import { useCart } from '../cart/CartContext'
import { ArrowLeft, Plus, ShoppingCart, Clock, Check, Minus } from 'lucide-react'

interface Category { id: string; name: string }
interface Product { id: string; name: string; description: string; price: number; category_id: string; image_url: string | null }
interface Vendor { id: string; name: string; description: string; avg_prep_time_minutes?: number }

const foodPhotos = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=640&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=640&auto=format&fit=crop&q=80'
]
function imageFor(product: Product) {
  if (product.image_url) return product.image_url
  const name = product.name.toLowerCase()
  if (name.includes('burger')) return foodPhotos[1]
  if (name.includes('pizza')) return foodPhotos[2]
  if (name.includes('rice') || name.includes('yam') || name.includes('chicken') || name.includes('chips')) return foodPhotos[3]
  if (name.includes('drink') || name.includes('water') || name.includes('coke') || name.includes('malt') || name.includes('coffee') || name.includes('tea')) return foodPhotos[4]
  return foodPhotos[0]
}

export default function VendorMenuPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart, items, itemCount, total } = useCart()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addedId, setAddedId] = useState('')

  useEffect(() => {
    async function fetchMenu() {
      if (!slug) return
      const { data: vendorData } = await supabase.from('vendors')
        .select('id, name, description, avg_prep_time_minutes').eq('slug', slug).single()
      if (vendorData) {
        setVendor(vendorData)
        const { data: catData } = await supabase.from('categories')
          .select('id, name').eq('vendor_id', vendorData.id).eq('is_active', true).order('sort_order')
        if (catData) setCategories(catData)
        const { data: prodData } = await supabase.from('products')
          .select('id, name, description, price, category_id, image_url')
          .eq('vendor_id', vendorData.id).eq('is_available', true).order('name')
        if (prodData) setProducts(prodData)
      }
      setLoading(false)
    }
    fetchMenu()
  }, [slug])

  const vendorItems = useMemo(() => items.filter(item => item.vendor_id === vendor?.id), [items, vendor?.id])
  const vendorCount = vendorItems.reduce((sum,item)=>sum+item.quantity,0)
  const vendorTotal = vendorItems.reduce((sum,item)=>sum+item.price*item.quantity,0)
  const formatPrice = (price: number) => `₦${(price / 100).toLocaleString()}`

  if (loading) return <div className="min-h-screen bg-[#f7f8fa] p-4"><div className="mx-auto max-w-3xl space-y-4">{[1,2,3].map(i=><div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200"/>)}</div></div>

  return (
    <main className="min-h-screen bg-[#f7f8fa] pb-32">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <button onClick={()=>navigate(-1)} aria-label="Go back" className="rounded-xl p-2 text-[#123b5d] hover:bg-slate-100"><ArrowLeft size={21}/></button>
          <div className="min-w-0 flex-1 px-3 text-center"><h1 className="truncate font-extrabold text-[#123b5d]">{vendor?.name}</h1><p className="text-xs text-slate-500">Menu · Order ahead, collect when ready</p></div>
          <Link to="/cart" aria-label="View cart" className="relative rounded-xl p-2 text-[#123b5d] hover:bg-slate-100"><ShoppingCart size={21}/>{itemCount>0&&<span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">{itemCount}</span>}</Link>
        </div>
      </header>
      <section className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-7 rounded-3xl bg-[#123b5d] p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-orange-200">Made for campus life</p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">What would you like today?</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">{vendor?.description || 'Choose your favourites and place an order for pickup.'}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-blue-100"><Clock size={14}/> Typical preparation: {vendor?.avg_prep_time_minutes || 15} minutes</div>
        </div>
        {categories.length===0 ? <p className="py-16 text-center text-slate-500">No menu items available yet.</p> : categories.map(category=>{
          const categoryProducts=products.filter(p=>p.category_id===category.id)
          if(!categoryProducts.length)return null
          return <section key={category.id} className="mb-8"><div className="mb-4 flex items-end justify-between"><h3 className="text-xl font-extrabold text-[#123b5d]">{category.name}</h3><span className="text-xs text-slate-400">{categoryProducts.length} items</span></div>
            <div className="grid gap-4 sm:grid-cols-2">{categoryProducts.map(product=><article key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative h-40 overflow-hidden bg-slate-100"><img src={imageFor(product)} alt={product.name} loading="lazy" className="h-full w-full object-cover" onError={e=>{e.currentTarget.src=foodPhotos[0]}}/><span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-600">Illustrative image</span></div>
              <div className="flex items-start justify-between gap-3 p-4"><div className="min-w-0 flex-1"><h4 className="font-bold text-slate-900">{product.name}</h4><p className="mt-1 line-clamp-2 min-h-9 text-xs leading-5 text-slate-500">{product.description || 'Freshly prepared and ready for pickup.'}</p><p className="mt-3 font-extrabold text-[#123b5d]">{formatPrice(product.price)}</p></div>
                <button onClick={()=>{addToCart({id:product.id,vendor_id:vendor!.id,name:product.name,price:product.price,image_url:product.image_url||imageFor(product)});setAddedId(product.id);window.setTimeout(()=>setAddedId(''),900)}} aria-label={`Add ${product.name} to cart`} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600">{addedId===product.id?<Check size={19}/>:<Plus size={19}/>}</button>
              </div>
            </article>)}</div>
          </section>
        })}
      </section>
      {vendorCount>0&&<div className="fixed inset-x-0 bottom-4 z-30 px-4"><div className="mx-auto flex max-w-xl items-center justify-between gap-4 rounded-2xl bg-[#123b5d] p-3 text-white shadow-2xl ring-1 ring-white/15"><div className="min-w-0"><p className="text-sm font-bold">{vendorCount} item{vendorCount===1?'':'s'} selected</p><p className="text-xs text-blue-100">{formatPrice(vendorTotal)} · {vendor?.name}</p></div><Link to="/cart" className="flex shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600">View cart <ArrowLeft className="rotate-180" size={16}/></Link></div></div>}
    </main>
  )
}
