import { useState, useEffect, useCallback } from "react"
import Header from "./component/Header"
import SearchBar from "./component/SearchBar"
import ItemForm from "./component/ItemForm"
import ItemList from "./component/ItemList"
import { fetchItems, createItem, updateItem, deleteItem, checkHealth } from "./services/api"

function App() {
  // ==================== STATE ====================
  const [items, setItems] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  // ==================== LOAD DATA ====================
  const loadItems = useCallback(async (search = "") => {
    setLoading(true)
    try {
      const data = await fetchItems(search)
      setItems(data.items)
      setTotalItems(data.total)
    } catch (err) {
      console.error("Error loading items:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // ==================== ON MOUNT ====================
  useEffect(() => {
    // Cek koneksi API
    checkHealth().then(setIsConnected)
    // Load items
    loadItems()
  }, [loadItems])

  // ==================== HANDLERS ====================

  const handleSubmit = async (itemData, editId) => {
    if (editId) {
      // Mode edit
      await updateItem(editId, itemData)
      setEditingItem(null)
    } else {
      // Mode create
      await createItem(itemData)
    }
    // Reload daftar items
    loadItems(searchQuery)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    // Scroll ke atas ke form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    const item = items.find((i) => i.id === id)
    if (!window.confirm(`Yakin ingin menghapus "${item?.name}"?`)) return

    try {
      await deleteItem(id)
      loadItems(searchQuery)
    } catch (err) {
      alert("Gagal menghapus: " + err.message)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    loadItems(query)
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
  }

  const sortedItems = [...items].sort((firstItem, secondItem) => {
    if (sortBy === "name") {
      return firstItem.name.localeCompare(secondItem.name, "id-ID")
    }

    if (sortBy === "price") {
      return firstItem.price - secondItem.price
    }

    const firstCreatedAt = Date.parse(firstItem.created_at ?? "") || 0
    const secondCreatedAt = Date.parse(secondItem.created_at ?? "") || 0
    return secondCreatedAt - firstCreatedAt
  })

  // ==================== RENDER ====================
  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <Header totalItems={totalItems} isConnected={isConnected} />
        <ItemForm
          onSubmit={handleSubmit}
          editingItem={editingItem}
          onCancelEdit={handleCancelEdit}
        />
        <SearchBar onSearch={handleSearch} />
        <div style={styles.sortRow}>
          <label htmlFor="sort-items" style={styles.sortLabel}>
            Urutkan berdasarkan:
          </label>
          <select
            id="sort-items"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            style={styles.sortSelect}
          >
            <option value="name">Nama</option>
            <option value="price">Harga</option>
            <option value="newest">Terbaru</option>
          </select>
        </div>
        <ItemList
          items={sortedItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  )
}

const styles = {
  app: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "2rem",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  sortRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },
  sortLabel: {
    color: "#1F4E79",
    fontWeight: "bold",
    fontSize: "0.95rem",
  },
  sortSelect: {
    minWidth: "220px",
    padding: "0.7rem 0.9rem",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "0.95rem",
    backgroundColor: "#fff",
    color: "#333",
  },
}

export default App