import { useState, useEffect, useCallback } from "react"
import Header from "./component/Header"
import SearchBar from "./component/SearchBar"
import ItemForm from "./component/ItemForm"
import ItemList from "./component/ItemList"
import LoginPage from "./component/LoginPage"
import {
  fetchItems, createItem, updateItem, deleteItem,
  checkHealth, login, register, clearToken,
} from "./services/api"

function App() {
  // ==================== AUTH STATE ====================
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // ==================== APP STATE ====================
  const [items, setItems] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  // ✅ FILTER STATE
  const [filter, setFilter] = useState("name")

  // ==================== NOTIFICATION ====================
  const [notification, setNotification] = useState({
    type: "",
    message: "",
  })

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification({ type: "", message: "" })
    }, 3000)
  }

  // ==================== LOAD DATA ====================
  const loadItems = useCallback(async (search = "") => {
    setLoading(true)
    try {
      const data = await fetchItems(search)
      setItems(data.items)
      setTotalItems(data.total)
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout()
      } else {
        showNotification("error", "Gagal memuat data")
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkHealth().then(setIsConnected)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadItems()
    }
  }, [isAuthenticated, loadItems])

  // ==================== SORTING FUNCTION ====================
  const getSortedItems = () => {
    let sorted = [...items]

    if (filter === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    } else if (filter === "price") {
      sorted.sort((a, b) => a.price - b.price)
    } else if (filter === "newest") {
      sorted.sort((a, b) => b.id - a.id)
    }

    return sorted
  }

  // ==================== AUTH ====================
  const handleLogin = async (email, password) => {
    try {
      const data = await login(email, password)
      setUser(data.user)
      setIsAuthenticated(true)
      showNotification("success", "Login berhasil")
    } catch {
      showNotification("error", "Login gagal")
    }
  }

  const handleRegister = async (userData) => {
    try {
      await register(userData)
      await handleLogin(userData.email, userData.password)
      showNotification("success", "Register berhasil")
    } catch {
      showNotification("error", "Register gagal")
    }
  }

  const handleLogout = () => {
    clearToken()
    setUser(null)
    setIsAuthenticated(false)
    setItems([])
    setTotalItems(0)
    setEditingItem(null)
    setSearchQuery("")
    showNotification("success", "Logout berhasil")
  }

  // ==================== ITEM ====================
  const handleSubmit = async (itemData, editId) => {
    setActionLoading(true)
    try {
      if (editId) {
        await updateItem(editId, itemData)
        setEditingItem(null)
        showNotification("success", "Item berhasil diupdate")
      } else {
        await createItem(itemData)
        showNotification("success", "Item berhasil ditambahkan")
      }
      loadItems(searchQuery)
    } catch (err) {
      if (err.message === "UNAUTHORIZED") handleLogout()
      else showNotification("error", "Gagal menyimpan data")
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id) => {
    const item = items.find((i) => i.id === id)
    if (!window.confirm(`Yakin ingin menghapus "${item?.name}"?`)) return

    setActionLoading(true)
    try {
      await deleteItem(id)
      showNotification("success", "Item berhasil dihapus")
      loadItems(searchQuery)
    } catch (err) {
      if (err.message === "UNAUTHORIZED") handleLogout()
      else showNotification("error", "Gagal menghapus data")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    loadItems(query)
  }

  // ==================== RENDER ====================
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />
  }

  return (
    <div style={styles.app}>
      <div style={styles.container}>

        {/* NOTIFICATION */}
        {notification.message && (
          <div style={styles.notification(notification.type)}>
            {notification.message}
          </div>
        )}

        {/* SPINNER */}
        {actionLoading && <div style={styles.spinner}></div>}

        <Header
          totalItems={totalItems}
          isConnected={isConnected}
          user={user}
          onLogout={handleLogout}
        />

        <ItemForm
          onSubmit={handleSubmit}
          editingItem={editingItem}
          onCancelEdit={() => setEditingItem(null)}
          loading={actionLoading}
        />

        <SearchBar onSearch={handleSearch} />

        {/* ✅ DROPDOWN FILTER */}
        <div style={{ margin: "10px 0" }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          >
            <option value="name">Urutkan: Nama</option>
            <option value="price">Urutkan: Harga</option>
            <option value="newest">Urutkan: Terbaru</option>
          </select>
        </div>

        <ItemList
          items={getSortedItems()}   // ✅ pakai hasil sorting
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

  notification: (type) => ({
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "6px",
    color: "#fff",
    textAlign: "center",
    backgroundColor: type === "success" ? "#28a745" : "#dc3545",
  }),

  spinner: {
    width: "40px",
    height: "40px",
    border: "5px solid #ccc",
    borderTop: "5px solid #007bff",
    borderRadius: "50%",
    animation: "spin 50s linear infinite",
    margin: "10px auto",
  },
}

export default App