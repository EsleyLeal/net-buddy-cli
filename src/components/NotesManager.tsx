import { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  cliente: string;
  conteudo: string;
  dataRegistro: string;
}

const NotesManager = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cliente: '',
    conteudo: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const stored = localStorage.getItem('noc-notes');
    if (stored) {
      setNotes(JSON.parse(stored));
    }
  };

  const saveNotes = (updatedNotes: Note[]) => {
    localStorage.setItem('noc-notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const addNote = () => {
    if (!formData.cliente || !formData.conteudo) {
      toast({
        title: "Erro",
        description: "Cliente e conteúdo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      cliente: formData.cliente,
      conteudo: formData.conteudo,
      dataRegistro: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);

    setFormData({ cliente: '', conteudo: '' });
    setShowForm(false);

    toast({
      title: "Nota adicionada",
      description: `Nota para ${formData.cliente}`,
    });
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
    
    toast({
      title: "Nota removida",
      description: "Nota excluída com sucesso",
    });
  };

  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notas-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportação concluída",
      description: "Arquivo JSON baixado com sucesso",
    });
  };

  const filteredNotes = notes.filter(note =>
    note.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.conteudo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center">
            <FileText className="h-8 w-8 mr-3" />
            Notas Técnicas
          </h1>
          <p className="text-muted-foreground mt-1">
            Anotações por cliente e parceiro
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={exportNotes} variant="outline" className="terminal-button">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="terminal-button">
            <Plus className="h-4 w-4 mr-2" />
            Nova Nota
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{notes.length}</div>
          <div className="text-muted-foreground text-sm">Total de Notas</div>
        </div>
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-accent">
            {new Set(notes.map(n => n.cliente)).size}
          </div>
          <div className="text-muted-foreground text-sm">Clientes/Parceiros</div>
        </div>
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-green-300">
            {filteredNotes.length}
          </div>
          <div className="text-muted-foreground text-sm">Resultados</div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Buscar notas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="terminal-input"
        />
      </div>

      {/* Form */}
      {showForm && (
        <div className="terminal-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Nova Nota</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="cliente">Cliente/Parceiro *</Label>
              <Input
                id="cliente"
                value={formData.cliente}
                onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                className="terminal-input"
                placeholder="Nome do cliente ou parceiro"
              />
            </div>
            
            <div>
              <Label htmlFor="conteudo">Conteúdo da Nota *</Label>
              <Textarea
                id="conteudo"
                value={formData.conteudo}
                onChange={(e) => setFormData({...formData, conteudo: e.target.value})}
                className="terminal-input"
                placeholder="Anotações técnicas, configurações, observações..."
                rows={6}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button onClick={addNote} className="terminal-button">
              Salvar Nota
            </Button>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <div key={note.id} className="terminal-card p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-primary text-lg">
                  {note.cliente}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(note.dataRegistro).toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteNote(note.id)}
                className="p-1 h-auto text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-muted/20 rounded p-3 border-l-4 border-primary">
              <pre className="font-mono text-sm text-card-foreground whitespace-pre-wrap">
                {note.conteudo}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && notes.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Nenhuma nota encontrada para "{searchQuery}"
          </p>
        </div>
      )}

      {notes.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhuma nota registrada. Clique em "Nova Nota" para começar.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotesManager;