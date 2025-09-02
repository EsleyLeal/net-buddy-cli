import { useState, useEffect } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface TroubleshootingItem {
  id: string;
  titulo: string;
  descricao: string;
  passos: string[];
  isCustom?: boolean;
}

const defaultTroubleshoot: TroubleshootingItem[] = [
  {
    id: '1',
    titulo: 'L2VC Down',
    descricao: 'Circuito L2VPN não está operacional',
    passos: [
      'Verificar status das interfaces físicas',
      'show mpls l2transport vc',
      'show xconnect all',
      'Verificar configuração de VC-ID',
      'Testar conectividade IP entre PEs'
    ]
  },
  {
    id: '2',
    titulo: 'BGP Peer Down',
    descricao: 'Sessão BGP não estabelece ou cai constantemente',  
    passos: [
      'show ip bgp summary',
      'show ip bgp neighbors [IP]',
      'Verificar conectividade IP',
      'Validar AS numbers',
      'Checar filtros route-map'
    ]
  },
  {
    id: '3',
    titulo: 'OSPF Adjacency Failed',
    descricao: 'Adjacência OSPF não forma entre vizinhos',
    passos: [
      'show ip ospf neighbor',
      'show ip ospf interface',
      'Verificar area-id',
      'Validar hello/dead timers',
      'Checar autenticação OSPF'
    ]
  }
];

const TroubleshootingGuide = () => {
  const [troubleshoots, setTroubleshoots] = useState<TroubleshootingItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    passos: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTroubleshoots();
  }, []);

  const loadTroubleshoots = () => {
    const customTroubleshoots = localStorage.getItem('noc-troubleshoots');
    const customData = customTroubleshoots ? JSON.parse(customTroubleshoots) : [];
    setTroubleshoots([...defaultTroubleshoot, ...customData]);
  };

  const addTroubleshoot = () => {
    if (!formData.titulo || !formData.descricao || !formData.passos) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const newTroubleshoot: TroubleshootingItem = {
      id: Date.now().toString(),
      titulo: formData.titulo,
      descricao: formData.descricao,
      passos: formData.passos.split('\n').filter(step => step.trim()),
      isCustom: true
    };

    const customTroubleshoots = localStorage.getItem('noc-troubleshoots');
    const currentCustom = customTroubleshoots ? JSON.parse(customTroubleshoots) : [];
    const newCustom = [...currentCustom, newTroubleshoot];
    
    localStorage.setItem('noc-troubleshoots', JSON.stringify(newCustom));
    setTroubleshoots([...troubleshoots, newTroubleshoot]);

    setFormData({ titulo: '', descricao: '', passos: '' });
    setShowForm(false);

    toast({
      title: "Troubleshooting adicionado",
      description: formData.titulo,
    });
  };

  const deleteTroubleshoot = (id: string) => {
    const itemToDelete = troubleshoots.find(item => item.id === id);
    if (!itemToDelete?.isCustom) {
      toast({
        title: "Erro",
        description: "Não é possível excluir itens padrão",
        variant: "destructive",
      });
      return;
    }

    const updatedTroubleshoots = troubleshoots.filter(item => item.id !== id);
    const customOnly = updatedTroubleshoots.filter(item => item.isCustom);
    
    localStorage.setItem('noc-troubleshoots', JSON.stringify(customOnly));
    setTroubleshoots(updatedTroubleshoots);

    toast({
      title: "Troubleshooting removido",
      description: "Item excluído com sucesso",
    });
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center">
            <AlertTriangle className="h-8 w-8 mr-3" />
            Guia de Troubleshooting
          </h1>
          <p className="text-muted-foreground mt-1">
            Soluções para problemas comuns em redes
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="terminal-button">
          <Plus className="h-4 w-4 mr-2" />
          Novo Troubleshoot
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="terminal-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Adicionar Troubleshooting</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título do Problema *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                className="terminal-input"
                placeholder="Ex: Interface Down, Routing Loop"
              />
            </div>
            
            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                className="terminal-input"
                placeholder="Breve descrição do problema"
              />
            </div>

            <div>
              <Label htmlFor="passos">Passos de Solução *</Label>
              <Textarea
                id="passos"
                value={formData.passos}
                onChange={(e) => setFormData({...formData, passos: e.target.value})}
                className="terminal-input"
                placeholder="Digite cada passo em uma linha separada..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cada linha será um passo da solução
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button onClick={addTroubleshoot} className="terminal-button">
              Adicionar
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{troubleshoots.length}</div>
          <div className="text-muted-foreground text-sm">Total de Guias</div>
        </div>
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-accent">
            {troubleshoots.filter(t => t.isCustom).length}
          </div>
          <div className="text-muted-foreground text-sm">Personalizados</div>
        </div>
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-green-300">
            {defaultTroubleshoot.length}
          </div>
          <div className="text-muted-foreground text-sm">Padrão</div>
        </div>
      </div>

      {/* Troubleshooting List */}
      <div className="space-y-4">
        {troubleshoots.map((item) => (
          <div key={item.id} className="terminal-card">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/10 transition-colors"
              onClick={() => toggleExpanded(item.id)}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-primary text-lg">
                    {item.titulo}
                  </h3>
                  {item.isCustom && (
                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                      Personalizado
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  {item.descricao}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {item.isCustom && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTroubleshoot(item.id);
                    }}
                    className="p-1 h-auto text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                {expandedItems.has(item.id) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {expandedItems.has(item.id) && (
              <div className="px-4 pb-4 border-t border-muted/20">
                <div className="pt-4">
                  <h4 className="font-medium text-primary mb-3">Passos para Solução:</h4>
                  <ol className="space-y-2">
                    {item.passos.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-primary/20 text-primary rounded-full text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-card-foreground font-mono text-sm">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {troubleshoots.length === 0 && (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhum guia de troubleshooting encontrado
          </p>
        </div>
      )}
    </div>
  );
};

export default TroubleshootingGuide;