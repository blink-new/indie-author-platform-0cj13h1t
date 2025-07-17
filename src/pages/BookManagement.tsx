import { useState, useEffect, useCallback } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Switch } from '../components/ui/switch'
import { blink, supabase } from '../lib/blink'
import { 
  BookOpen, 
  Plus,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Image as ImageIcon,
  Clock
} from 'lucide-react'
import { useToast } from '../hooks/use-toast'

interface Book {
  id: string
  title: string
  description?: string
  book_type: 'arc' | 'beta' | 'sale'
  price?: number
  file_url?: string
  file_type?: string
  cover_image_url?: string
  expiration_date?: string
  collect_emails: boolean
  download_count: number
  created_at: string
  updated_at: string
}

interface User {
  id: string
  email: string
  displayName?: string
}

export default function BookManagement() {
  const [user, setUser] = useState<User | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    book_type: 'arc' as 'arc' | 'beta' | 'sale',
    price: '',
    collect_emails: true,
    expiration_date: ''
  })
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)

  const loadBooks = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data: userBooks, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setBooks(userBooks || [])
    } catch (error) {
      console.error('Error loading books:', error)
      toast({
        title: "Error",
        description: "Failed to load your books. Please try again.",
        variant: "destructive"
      })
    }
  }, [user?.id, toast])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      if (state.user && !state.isLoading) {
        loadBooks()
      }
    })
    return unsubscribe
  }, [loadBooks])

  const handleFileUpload = async (file: File, type: 'book' | 'cover'): Promise<string> => {
    const fileName = `${type}s/${user?.id}/${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('books')
      .upload(fileName, file, { upsert: true })
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('books')
      .getPublicUrl(data.path)
    
    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !bookFile) return

    setUploading(true)
    try {
      // Upload book file
      const fileUrl = await handleFileUpload(bookFile, 'book')
      
      // Upload cover image if provided
      let coverImageUrl = ''
      if (coverImage) {
        coverImageUrl = await handleFileUpload(coverImage, 'cover')
      }

      // Create book record
      const bookData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description || null,
        book_type: formData.book_type,
        price: formData.price ? parseFloat(formData.price) : null,
        file_url: fileUrl,
        file_type: bookFile.type,
        cover_image_url: coverImageUrl || null,
        expiration_date: formData.expiration_date || null,
        collect_emails: formData.collect_emails,
        download_count: 0
      }

      const { error } = await supabase.from('books').insert(bookData)
      if (error) throw error
      
      toast({
        title: "Success!",
        description: "Your book has been uploaded successfully."
      })

      // Reset form and reload books
      setFormData({
        title: '',
        description: '',
        book_type: 'arc',
        price: '',
        collect_emails: true,
        expiration_date: ''
      })
      setBookFile(null)
      setCoverImage(null)
      setShowUploadDialog(false)
      loadBooks()
    } catch (error) {
      console.error('Error uploading book:', error)
      toast({
        title: "Error",
        description: "Failed to upload your book. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const deleteBook = async (bookId: string) => {
    try {
      const { error } = await supabase.from('books').delete().eq('id', bookId)
      if (error) throw error
      
      toast({
        title: "Success",
        description: "Book deleted successfully."
      })
      loadBooks()
    } catch (error) {
      console.error('Error deleting book:', error)
      toast({
        title: "Error",
        description: "Failed to delete book. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getBookTypeColor = (type: string) => {
    switch (type) {
      case 'arc': return 'bg-blue-500'
      case 'beta': return 'bg-orange-500'
      case 'sale': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getBookTypeLabel = (type: string) => {
    switch (type) {
      case 'arc': return 'ARC Copy'
      case 'beta': return 'Beta Read'
      case 'sale': return 'For Sale'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <p className="text-muted-foreground">Loading your books...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
          <p className="text-muted-foreground mb-6">You need to be signed in to manage your books.</p>
          <Button onClick={() => blink.auth.login()}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Book Management</h1>
            <p className="text-muted-foreground">
              Upload, organize, and distribute your books to readers.
            </p>
          </div>
          
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                <Plus className="w-4 h-4 mr-2" />
                Upload Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload New Book</DialogTitle>
                <DialogDescription>
                  Add a new book to your library. Choose the type and set up distribution options.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Book Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter book title"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="book_type">Book Type *</Label>
                    <Select value={formData.book_type} onValueChange={(value: 'arc' | 'beta' | 'sale') => setFormData({ ...formData, book_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="arc">ARC Copy (Advance Review Copy)</SelectItem>
                        <SelectItem value="beta">Beta Read</SelectItem>
                        <SelectItem value="sale">For Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of your book"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {formData.book_type === 'sale' && (
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                  
                  {(formData.book_type === 'arc' || formData.book_type === 'beta') && (
                    <div className="space-y-2">
                      <Label htmlFor="expiration_date">Expiration Date</Label>
                      <Input
                        id="expiration_date"
                        type="datetime-local"
                        value={formData.expiration_date}
                        onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="book_file">Book File *</Label>
                    <Input
                      id="book_file"
                      type="file"
                      accept=".pdf,.epub,.mobi"
                      onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Supported formats: PDF, EPUB, MOBI
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cover_image">Cover Image</Label>
                    <Input
                      id="cover_image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional: Upload a cover image for your book
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="collect_emails"
                    checked={formData.collect_emails}
                    onCheckedChange={(checked) => setFormData({ ...formData, collect_emails: checked })}
                  />
                  <Label htmlFor="collect_emails">Collect reader emails before download</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Book'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Books Grid */}
        {books.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No books yet</h3>
              <p className="text-muted-foreground mb-6">
                Upload your first book to start building your author platform.
              </p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Your First Book
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card key={book.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{book.title}</CardTitle>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={`${getBookTypeColor(book.book_type)} text-white`}>
                          {getBookTypeLabel(book.book_type)}
                        </Badge>
                        {book.price && (
                          <Badge variant="outline">
                            <DollarSign className="w-3 h-3 mr-1" />
                            ${book.price}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {book.cover_image_url && (
                      <div className="w-16 h-20 bg-muted rounded-md overflow-hidden ml-4">
                        <img 
                          src={book.cover_image_url} 
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  {book.description && (
                    <CardDescription className="line-clamp-2">
                      {book.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>{book.download_count} downloads</span>
                      </div>
                      {book.expiration_date && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Expires {new Date(book.expiration_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => deleteBook(book.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}