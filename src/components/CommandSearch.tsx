import { useState, useEffect } from 'react';
import { Search, Copy, Star, StarOff, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Fuse from 'fuse.js';

interface Command {
  comando: string;
  dispositivo: string;
  protocolo: string;
  tarefa: string;
  descricao: string;
}

const CommandSearch = () => {
  const [commands, setCommands] = useState<Command[]>([]);
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    comando: '',
    dispositivo: '',
    protocolo: '',
    tarefa: '',
    descricao: ''
  });
  const { toast } = useToast();

  const fuse = new Fuse(commands, {
    keys: ['comando', 'dispositivo', 'protocolo', 'tarefa', 'descricao'],
    threshold: 0.3,
    includeScore: true,
  });

  useEffect(() => {
    loadCommands();
    loadFavorites();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCommands(commands);
    } else {
      const results = fuse.search(searchQuery);
      setFilteredCommands(results.map(result => result.item));
    }
  }, [searchQuery, commands]);

  const loadCommands = async () => {
    try {
      // Carregar comandos do JSON
      const response = await fetch('/comandos.json');
      const jsonData = await response.json();
      
      // Carregar comandos customizados do localStorage
      const customCommands = localStorage.getItem('noc-custom-commands');
      const customData = customCommands ? JSON.parse(customCommands) : [];
      
      const allCommands = [...jsonData, ...customData];
      setCommands(allCommands);
      setFilteredCommands(allCommands);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar comandos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const stored = localStorage.getItem('noc-favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  };

  const toggleFavorite = (comando: string) => {
    const newFavorites = favorites.includes(comando)
      ? favorites.filter(fav => fav !== comando)
      : [...favorites, comando];
    
    setFavorites(newFavorites);
    localStorage.setItem('noc-favorites', JSON.stringify(newFavorites));
    
    toast({
      title: favorites.includes(comando) ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: comando,
    });
  };

  const copyCommand = (comando: string) => {
    navigator.clipboard.writeText(comando);
    toast({
      title: "Comando copiado",
      description: comando,
    });
  };

  const getDeviceColor = (dispositivo: string) => {
    switch (dispositivo.toLowerCase()) {
      case 'cisco': return 'bg-blue-500/20 text-blue-300';
      case 'huawei': return 'bg-red-500/20 text-red-300';
      case 'datacom': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const addCommand = () => {
    if (!formData.comando || !formData.dispositivo || !formData.protocolo || !formData.tarefa || !formData.descricao) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const customCommands = localStorage.getItem('noc-custom-commands');
    const currentCustom = customCommands ? JSON.parse(customCommands) : [];
    const newCustom = [...currentCustom, formData];
    
    localStorage.setItem('noc-custom-commands', JSON.stringify(newCustom));
    
    const allCommands = [...commands, formData];
    setCommands(allCommands);
    setFilteredCommands(allCommands);
    
    setFormData({
      comando: '',
      dispositivo: '',
      protocolo: '',
      tarefa: '',
      descricao: ''
    });
    setShowForm(false);

    toast({
      title: "Comando adicionado",
      description: `${formData.comando} foi adicionado com sucesso`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-primary">Carregando comandos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-primary mb-2">Busca de Comandos</h1>
          <p className="text-muted-foreground">
            Consulte comandos para equipamentos Cisco, Huawei e Datacom
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="terminal-button">
          <Plus className="h-4 w-4 mr-2" />
          Novo Comando
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="terminal-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Adicionar Comando</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="comando">Comando *</Label>
              <Input
                id="comando"
                value={formData.comando}
                onChange={(e) => setFormData({...formData, comando: e.target.value})}
                className="terminal-input"
                placeholder="Ex: show ip bgp"
              />
            </div>
            
            <div>
              <Label htmlFor="dispositivo">Dispositivo *</Label>
              <Select onValueChange={(value) => setFormData({...formData, dispositivo: value})}>
                <SelectTrigger className="terminal-input">
                  <SelectValue placeholder="Selecione o dispositivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cisco">Cisco</SelectItem>
                  <SelectItem value="Huawei">Huawei</SelectItem>
                  <SelectItem value="Datacom">Datacom</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="protocolo">Protocolo *</Label>
              <Input
                id="protocolo"
                value={formData.protocolo}
                onChange={(e) => setFormData({...formData, protocolo: e.target.value})}
                className="terminal-input"
                placeholder="Ex: BGP, OSPF, MPLS"
              />
            </div>

            <div>
              <Label htmlFor="tarefa">Tarefa *</Label>
              <Input
                id="tarefa"
                value={formData.tarefa}
                onChange={(e) => setFormData({...formData, tarefa: e.target.value})}
                className="terminal-input"
                placeholder="Ex: Verificar status"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                className="terminal-input"
                placeholder="Descrição detalhada do comando..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button onClick={addCommand} className="terminal-button">
              Adicionar Comando
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar comandos, dispositivos, protocolos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="terminal-input pl-10"
        />
      </div>

      {/* Stats */}
      <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
        <span>Total: {commands.length} comandos</span>
        <span>Resultados: {filteredCommands.length}</span>
        <span>Favoritos: {favorites.length}</span>
      </div>

      {/* Commands Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCommands.map((command, index) => (
          <div key={index} className="terminal-card p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <Badge className={getDeviceColor(command.dispositivo)}>
                {command.dispositivo}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(command.comando)}
                className="p-1 h-auto"
              >
                {favorites.includes(command.comando) ? (
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                ) : (
                  <StarOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            <div 
              className="font-mono text-primary cursor-pointer hover:text-accent transition-colors mb-2"
              onClick={() => copyCommand(command.comando)}
              title="Clique para copiar"
            >
              {command.comando}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protocolo:</span>
                <Badge variant="outline">{command.protocolo}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tarefa:</span>
                <span className="text-card-foreground">{command.tarefa}</span>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mt-3">
              {command.descricao}
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => copyCommand(command.comando)}
              className="w-full mt-3 terminal-button"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Comando
            </Button>
          </div>
        ))}
      </div>

      {filteredCommands.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Nenhum comando encontrado para "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
};

export default CommandSearch;