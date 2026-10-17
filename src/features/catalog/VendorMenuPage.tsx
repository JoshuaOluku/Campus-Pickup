import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'
import { useCart } from '../cart/CartContext'
import { ArrowLeft, Plus, ShoppingCart } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  category_id: string
}

interface Vendor {
  id: string
  name: string
  description: string
}

export default function VendorMenuPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart, itemCount } = useCart()
  
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMenu() {
      if (!slug) return

      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id, name, description')
        .eq('slug', slug)
        .single()

      if (vendorData) {
        setVendor(vendorData)

        const { data: catData } = await supabase
          .from('categories')
          .select('id, name')
          .eq('vendor_id', vendorData.id)
          .eq('is_active', true)
          .order('sort_order')

        if (catData) setCategories(catData)

        const { data: prodData } = await supabase
          .from('products')
          .select('id, name, description, price, category_id')
          .eq('vendor_id', vendorData.id)
          .eq('is_available', true)
          .order('name')

        if (prodData) setProducts(prodData)
      }
      setLoading(false)
    }

    fetchMenu()
  }, [slug])

  const formatPrice = (priceInKobo: number) => {
    return `₦${(priceInKobo / 100).toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white p-4">
        <div className="max-w-sm mx-auto space-y-4">
          <div className="h-8 w-1/2 bg-soft-slate rounded animate-pulse" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-soft-slate rounded-card animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-off-white pb-24">
      {/* Header */}
      <div className="bg-surface border-b border-soft-slate sticky top-0 z-10">
        <div className="max-w-sm mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-campus-blue">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-ink text-lg">{vendor?.name}</h1>
          
          {/* UPDATED: Wrapped in Link to navigate to /cart */}
          <Link to="/cart" className="relative p-2 -mr-2 text-campus-blue">
            <ShoppingCart className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-electric-orange text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-sm mx-auto px-4 py-6">
        {categories.length === 0 ? (
          <p className="text-center text-slate-muted mt-12">No menu items available.</p>
        ) : (
          categories.map(category => {
            const categoryProducts = products.filter(p => p.category_id === category.id)
            if (categoryProducts.length === 0) return null

            return (
              <div key={category.id} className="mb-8">
                <h2 className="text-xl font-bold text-campus-blue mb-4">{category.name}</h2>
                <div className="space-y-4">
                  {categoryProducts.map(product => (
                    <div key={product.id} className="bg-surface rounded-card p-4 shadow-sm border border-soft-slate flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-ink">{product.name}</h3>
                        <p className="text-sm text-slate-muted mt-1 line-clamp-2">{product.description}</p>
                        <p className="font-bold text-campus-blue mt-2">{formatPrice(product.price)}</p>
                      </div>
                      <button
                        onClick={() => addToCart({
                          id: product.id,
                          vendor_id: vendor!.id,
                          name: product.name,
                          price: product.price
                        })}
                        className="bg-warm-orange text-electric-orange p-2 rounded-lg hover:bg-orange-100 transition-colors flex-shrink-0"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}