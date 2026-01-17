'use client'

import React, { useEffect, useState } from 'react'
import { Plus, RefreshCw, Trash2, Edit2, Image as ImageIcon, Star, X, UploadCloud, Loader2, Save } from 'lucide-react'
import Swal from 'sweetalert2'
import clsx from 'clsx'
import { Product, ProductImage, emptyProducto } from './types'
import * as productService from '@/services/product.service'

// --- Sub-componente Card (Integrado aquí para facilitar el copiado) ---
const ProductCard = ({ 
  producto, 
  onEdit, 
  onDelete, 
  onUpload, 
  onRemoveImage, 
  onSetPrimary,
  uploading 
}: any) => {
  const primaryImg = producto.imagenes?.find((i: ProductImage) => i.isPrimary)?.url || producto.imagenes?.[0]?.url

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4 group hover:border-pink-500/30 transition-all">
      <div className="flex gap-4">
        {/* Thumbnail / Upload Area */}
        <div className="relative w-20 h-20 bg-zinc-950 rounded-lg flex-shrink-0 overflow-hidden border border-zinc-800 group-hover:border-zinc-700">
          {primaryImg ? (
            <img src={primaryImg} alt={producto.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700"><ImageIcon className="w-8 h-8" /></div>
          )}
          
          {/* Overlay Upload */}
          <label className={clsx("absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer", uploading && "opacity-100 bg-black/80")}>
            {uploading ? <Loader2 className="w-5 h-5 text-pink-500 animate-spin" /> : <UploadCloud className="w-5 h-5 text-white" />}
            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} disabled={uploading} />
          </label>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-white truncate pr-2">{producto.nombre}</h4>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onEdit} className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={onDelete} className="p-1.5 hover:bg-red-900/30 rounded text-zinc-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{producto.descripcion || 'Sin descripción'}</p>
          <p className="text-xs text-pink-400 font-mono mt-2">
            {producto.precioDesde ? `$${producto.precioDesde.toLocaleString()}` : 'Precio no definido'}
          </p>
        </div>
      </div>

      {/* Mini Galería */}
      {producto.imagenes && producto.imagenes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {producto.imagenes.map((img: ProductImage) => (
            <div key={img.id} className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden border border-zinc-800 group/img">
              <img src={img.url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1">
                 <button onClick={() => onSetPrimary(img.id)} className={clsx("text-[8px] p-0.5 rounded", img.isPrimary ? "text-yellow-400" : "text-white hover:text-yellow-400")}><Star className="w-3 h-3 fill-current" /></button>
                 <button onClick={() => onRemoveImage(img.id)} className="text-[8px] p-0.5 text-white hover:text-red-400"><X className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Componente Principal ---

export default function CatalogPanel() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [reloading, setReloading] = useState(false)
  
  // Estado del formulario de creación/edición
  const [formData, setFormData] = useState<Partial<Product>>({ nombre: '', descripcion: '', beneficios: '', caracteristicas: '', precioDesde: null })
  const [editingId, setEditingId] = useState<number | null>(null) // null = creando
  const [uploadingId, setUploadingId] = useState<number | null>(null)

  // Cargar datos
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true)
    else setReloading(true)
    try {
      const data = await productService.getProducts()
      setItems(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setReloading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // Guardar (Crear o Editar info básica)
  const handleSave = async () => {
    if (!formData.nombre?.trim()) return Swal.fire({ icon: 'warning', title: 'Falta nombre', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false })
    
    try {
      if (editingId) {
        // Update
        const updated = await productService.updateProduct(editingId, formData)
        setItems(prev => prev.map(p => p.id === editingId ? { ...updated, imagenes: p.imagenes } : p))
        Swal.fire({ icon: 'success', title: 'Actualizado', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false, background: '#09090b', color: '#fff' })
        setEditingId(null) // Salir de edición
      } else {
        // Create
        const created = await productService.createProduct(formData)
        setItems(prev => [created, ...prev])
        Swal.fire({ icon: 'success', title: 'Creado', text: 'Ya puedes subirle fotos en la lista.', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false, background: '#09090b', color: '#fff' })
      }
      // Reset form
      setFormData({ nombre: '', descripcion: '', beneficios: '', caracteristicas: '', precioDesde: null })
    } catch (e) {
      console.error(e)
      Swal.fire({ icon: 'error', title: 'Error al guardar', background: '#09090b', color: '#fff' })
    }
  }

  const handleEditClick = (p: Product) => {
    setEditingId(p.id!)
    setFormData({
      nombre: p.nombre,
      descripcion: p.descripcion,
      beneficios: p.beneficios,
      caracteristicas: p.caracteristicas,
      precioDesde: p.precioDesde
    })
    // Scroll to top smooth
    document.querySelector('#catalog-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({ nombre: '', descripcion: '', beneficios: '', caracteristicas: '', precioDesde: null })
  }

  const handleDelete = async (id: number) => {
    const res = await Swal.fire({
      title: '¿Eliminar?',
      text: "No podrás recuperar este producto.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
      background: '#09090b', color: '#fff'
    })
    if (!res.isConfirmed) return

    try {
      await productService.deleteProduct(id)
      setItems(prev => prev.filter(p => p.id !== id))
      if (editingId === id) handleCancelEdit()
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', background: '#09090b', color: '#fff' })
    }
  }

  // --- Imágenes ---

  const handleUpload = async (id: number, file: File) => {
    setUploadingId(id)
    try {
      const newImg = await productService.uploadProductImage(id, file)
      setItems(prev => prev.map(p => {
        if (p.id !== id) return p
        return { ...p, imagenes: [...(p.imagenes || []), newImg] }
      }))
    } catch (e) {
      console.error(e)
      Swal.fire({ icon: 'error', title: 'Error subiendo imagen', toast: true, background: '#09090b', color: '#fff' })
    } finally {
      setUploadingId(null)
    }
  }

  const handleRemoveImage = async (prodId: number, imgId: number) => {
    try {
      await productService.deleteProductImage(prodId, imgId)
      setItems(prev => prev.map(p => {
        if (p.id !== prodId) return p
        return { ...p, imagenes: p.imagenes.filter(i => i.id !== imgId) }
      }))
    } catch (e) { console.error(e) }
  }

  const handleSetPrimary = async (prodId: number, imgId: number) => {
    try {
      await productService.setPrimaryImage(prodId, imgId)
      setItems(prev => prev.map(p => {
        if (p.id !== prodId) return p
        const newImgs = p.imagenes.map(i => ({ ...i, isPrimary: i.id === imgId }))
        return { ...p, imagenes: newImgs }
      }))
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          Gestión de Catálogo
          {reloading && <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />}
        </h2>
        <button onClick={() => loadData(true)} disabled={reloading} className="text-xs flex items-center gap-1 text-zinc-500 hover:text-white transition-colors">
          <RefreshCw className={clsx("w-3 h-3", reloading && "animate-spin")} /> Actualizar
        </button>
      </div>

      {/* Formulario Crear/Editar */}
      <div id="catalog-form" className={clsx("grid grid-cols-1 md:grid-cols-2 gap-3 bg-zinc-900/50 border rounded-2xl p-4 transition-colors", editingId ? "border-pink-500/30 bg-pink-500/5" : "border-zinc-800")}>
        <div className="md:col-span-2 flex items-center justify-between mb-1">
          <span className={clsx("text-xs font-bold uppercase tracking-wider", editingId ? "text-pink-400" : "text-zinc-500")}>
            {editingId ? 'Editando Producto' : 'Nuevo Producto'}
          </span>
          {editingId && (
            <button onClick={handleCancelEdit} className="text-xs text-zinc-400 hover:text-white underline">Cancelar edición</button>
          )}
        </div>

        <input
          placeholder="Nombre del producto *"
          value={formData.nombre || ''}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50"
        />
        <input
          type="number"
          placeholder="Precio desde (opcional)"
          value={formData.precioDesde || ''}
          onChange={(e) => setFormData({ ...formData, precioDesde: e.target.value ? Number(e.target.value) : null })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50"
        />
        <input
          placeholder="Descripción corta"
          value={formData.descripcion || ''}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          className="md:col-span-2 w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50"
        />
        <textarea
          rows={2}
          placeholder="Beneficios (uno por línea)"
          value={formData.beneficios || ''}
          onChange={(e) => setFormData({ ...formData, beneficios: e.target.value })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50 resize-none"
        />
        <textarea
          rows={2}
          placeholder="Características (una por línea)"
          value={formData.caracteristicas || ''}
          onChange={(e) => setFormData({ ...formData, caracteristicas: e.target.value })}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50 resize-none"
        />

        <div className="md:col-span-2 mt-2">
          <button
            onClick={handleSave}
            type="button"
            className={clsx(
              "w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all",
              editingId ? "bg-pink-600 hover:bg-pink-500" : "bg-zinc-800 hover:bg-zinc-700"
            )}
          >
            {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
            {editingId ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </div>
      </div>

      {/* Lista de Productos */}
      {loading && !reloading ? (
        <div className="text-center py-10 text-zinc-500 text-sm animate-pulse">Cargando productos...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-xl">
          Tu catálogo está vacío. Crea tu primer producto arriba.
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Inventario ({items.length})</h3>
          <div className="grid grid-cols-1 gap-3">
            {items.map((p) => (
              <ProductCard
                key={p.id}
                producto={p}
                uploading={uploadingId === p.id}
                onEdit={() => handleEditClick(p)}
                onDelete={() => handleDelete(p.id!)}
                onUpload={(f: File) => handleUpload(p.id!, f)}
                onRemoveImage={(imgId: number) => handleRemoveImage(p.id!, imgId)}
                onSetPrimary={(imgId: number) => handleSetPrimary(p.id!, imgId)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}