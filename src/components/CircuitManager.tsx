import { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Circuit {
  id: string;
  cliente: string;
  parceiro: string;
  tipo: 'VPLS' | 'VPWS' | 'L2VPN';
  interfaces: string;
  vcId: string;
  vlans: string;
  status: 'Ativo' | 'Inativo';
  observacoes: string;
  dataRegistro: string;
}

const CircuitManager = () => {
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Circuit, 'id' | 'dataRegistro'>>({
    cliente: '',
    parceiro: '',
    tipo: 'VPLS',
    interfaces: '',
    vcId: '',
    vlans: '',
    status: 'Ativo',
    observacoes: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCircuits();
  }, []);

  const loadCircuits = () => {
    const stored = localStorage.getItem('noc-circuits');
    if (stored) {
      setCircuits(JSON.parse(stored));
    }
  };

  const saveCircuits = (updatedCircuits: Circuit[]) => {
    localStorage.setItem('noc-circuits', JSON.stringify(updatedCircuits));
    setCircuits(updatedCircuits);
  };

  const addCircuit = () => {
    if (!formData.cliente || !formData.parceiro) {
      toast({
        title: "Erro",
        description: "Cliente e Parceiro são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const newCircuit: Circuit = {
      ...formData,
      id: Date.now().toString(),
      dataRegistro: new Date().toISOString(),
    };

    const updatedCircuits = [...circuits, newCircuit];
    saveCircuits(updatedCircuits);

    setFormData({
      cliente: '',
      parceiro: '',
      tipo: 'VPLS',
      interfaces: '',
      vcId: '',
      vlans: '',
      status: 'Ativo',
      observacoes: '',
    });
    setShowForm(false);

    toast({
      title: "Circuito adicionado",
      description: `Circuito ${formData.tipo} para ${formData.cliente}`,
    });
  };

  const deleteCircuit = (id: string) => {
    const updatedCircuits = circuits.filter(circuit => circuit.id !== id);
    saveCircuits(updatedCircuits);
    
    toast({
      title: "Circuito removido",
      description: "Circuito excluído com sucesso",
    });
  };

  const exportCircuits = () => {
    const dataStr = JSON.stringify(circuits, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `circuitos-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportação concluída",
      description: "Arquivo JSON baixado com sucesso",
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'Ativo' 
      ? 'bg-green-500/20 text-green-300' 
      : 'bg-red-500/20 text-red-300';
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'VPLS': return 'bg-blue-500/20 text-blue-300';
      case 'VPWS': return 'bg-purple-500/20 text-purple-300';
      case 'L2VPN': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center">
            <Network className="h-8 w-8 mr-3" />
            Circuitos LAN-to-LAN
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerenciamento de circuitos VPLS, VPWS e L2VPN
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={exportCircuits} variant="outline" className="terminal-button">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="terminal-button">
            <Plus className="h-4 w-4 mr-2" />
            Novo Circuito
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{circuits.length}</div>
          <div className="text-muted-foreground text-sm">Total</div>
        </div>
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-green-300">
            {circuits.filter(c => c.status === 'Ativo').length}
          </div>
          <div className="text-muted-foreground text-sm">Ativos</div>
        </div>
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-red-300">
            {circuits.filter(c => c.status === 'Inativo').length}
          </div>
          <div className="text-muted-foreground text-sm">Inativos</div>
        </div>
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-300">
            {circuits.filter(c => c.tipo === 'VPLS').length}
          </div>
          <div className="text-muted-foreground text-sm">VPLS</div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="terminal-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Novo Circuito</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cliente">Cliente *</Label>
              <Input
                id="cliente"
                value={formData.cliente}
                onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                className="terminal-input"
                placeholder="Nome do cliente"
              />
            </div>
            
            <div>
              <Label htmlFor="parceiro">Parceiro *</Label>
              <Input
                id="parceiro"
                value={formData.parceiro}
                onChange={(e) => setFormData({...formData, parceiro: e.target.value})}
                className="terminal-input"
                placeholder="Nome do parceiro"
              />
            </div>
            
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={formData.tipo} onValueChange={(value: any) => setFormData({...formData, tipo: value})}>
                <SelectTrigger className="terminal-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VPLS">VPLS</SelectItem>
                  <SelectItem value="VPWS">VPWS</SelectItem>
                  <SelectItem value="L2VPN">L2VPN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                <SelectTrigger className="terminal-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="interfaces">Interfaces</Label>
              <Input
                id="interfaces"
                value={formData.interfaces}
                onChange={(e) => setFormData({...formData, interfaces: e.target.value})}
                className="terminal-input"
                placeholder="ex: Gig0/0/1, Ten0/1/0"
              />
            </div>
            
            <div>
              <Label htmlFor="vcId">VC-ID</Label>
              <Input
                id="vcId"
                value={formData.vcId}
                onChange={(e) => setFormData({...formData, vcId: e.target.value})}
                className="terminal-input"
                placeholder="ex: 2100"
              />
            </div>
            
            <div>
              <Label htmlFor="vlans">VLANs</Label>
              <Input
                id="vlans"
                value={formData.vlans}
                onChange={(e) => setFormData({...formData, vlans: e.target.value})}
                className="terminal-input"
                placeholder="ex: 100,200"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              className="terminal-input"
              placeholder="Anotações adicionais..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button onClick={addCircuit} className="terminal-button">
              Salvar Circuito
            </Button>
          </div>
        </div>
      )}

      {/* Circuits List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {circuits.map((circuit) => (
          <div key={circuit.id} className="terminal-card p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-1">
                <Badge className={getTipoColor(circuit.tipo)}>
                  {circuit.tipo}
                </Badge>
                <Badge className={getStatusColor(circuit.status)}>
                  {circuit.status}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteCircuit(circuit.id)}
                className="p-1 h-auto text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-primary font-semibold">Cliente:</span>
                <span className="ml-2 text-card-foreground">{circuit.cliente}</span>
              </div>
              <div>
                <span className="text-primary font-semibold">Parceiro:</span>
                <span className="ml-2 text-card-foreground">{circuit.parceiro}</span>
              </div>
              
              {circuit.interfaces && (
                <div>
                  <span className="text-muted-foreground">Interfaces:</span>
                  <span className="ml-2 font-mono text-card-foreground">{circuit.interfaces}</span>
                </div>
              )}
              
              {circuit.vcId && (
                <div>
                  <span className="text-muted-foreground">VC-ID:</span>
                  <span className="ml-2 font-mono text-card-foreground">{circuit.vcId}</span>
                </div>
              )}
              
              {circuit.vlans && (
                <div>
                  <span className="text-muted-foreground">VLANs:</span>
                  <span className="ml-2 font-mono text-card-foreground">{circuit.vlans}</span>
                </div>
              )}
            </div>

            {circuit.observacoes && (
              <div className="mt-3 p-2 bg-muted/20 rounded text-sm">
                <span className="text-muted-foreground">Obs:</span>
                <p className="text-card-foreground mt-1">{circuit.observacoes}</p>
              </div>
            )}

            <div className="text-xs text-muted-foreground mt-3">
              Registrado em: {new Date(circuit.dataRegistro).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {circuits.length === 0 && (
        <div className="text-center py-8">
          <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhum circuito registrado. Clique em "Novo Circuito" para começar.
          </p>
        </div>
      )}
    </div>
  );
};

export default CircuitManager;