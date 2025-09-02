import { useState } from 'react';
import { Download, Upload, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const BackupManager = () => {
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const getAllData = () => {
    return {
      'noc-favorites': localStorage.getItem('noc-favorites'),
      'noc-custom-commands': localStorage.getItem('noc-custom-commands'),
      'noc-circuits': localStorage.getItem('noc-circuits'),
      'noc-notes': localStorage.getItem('noc-notes'),
      'noc-troubleshoots': localStorage.getItem('noc-troubleshoots'),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  };

  const exportAllData = () => {
    const allData = getAllData();
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `noc-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Backup completo exportado",
      description: "Todos os dados foram salvos em arquivo JSON",
    });
  };

  const importAllData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Restaurar todos os dados
        Object.keys(data).forEach(key => {
          if (key !== 'exportDate' && key !== 'version' && data[key]) {
            localStorage.setItem(key, data[key]);
          }
        });

        toast({
          title: "Dados importados com sucesso",
          description: "Recarregue a página para ver as alterações",
        });
        
        // Recarregar a página após 2 segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "Arquivo inválido ou corrompido",
          variant: "destructive",
        });
      } finally {
        setImporting(false);
        event.target.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação é irreversível.')) {
      localStorage.removeItem('noc-favorites');
      localStorage.removeItem('noc-custom-commands');
      localStorage.removeItem('noc-circuits');
      localStorage.removeItem('noc-notes');
      localStorage.removeItem('noc-troubleshoots');
      
      toast({
        title: "Dados limpos",
        description: "Todos os dados foram removidos. Recarregando...",
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const getDataStats = () => {
    const data = getAllData();
    return {
      favorites: data['noc-favorites'] ? JSON.parse(data['noc-favorites']).length : 0,
      customCommands: data['noc-custom-commands'] ? JSON.parse(data['noc-custom-commands']).length : 0,
      circuits: data['noc-circuits'] ? JSON.parse(data['noc-circuits']).length : 0,
      notes: data['noc-notes'] ? JSON.parse(data['noc-notes']).length : 0,
      troubleshoots: data['noc-troubleshoots'] ? JSON.parse(data['noc-troubleshoots']).length : 0,
    };
  };

  const stats = getDataStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <Save className="h-8 w-8 mr-3" />
          Backup e Restore
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie backup e restore de todos os dados
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-300">{stats.favorites}</div>
          <div className="text-muted-foreground text-sm">Favoritos</div>
        </div>
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-green-300">{stats.customCommands}</div>
          <div className="text-muted-foreground text-sm">Comandos</div>
        </div>
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-300">{stats.circuits}</div>
          <div className="text-muted-foreground text-sm">Circuitos</div>
        </div>
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-300">{stats.notes}</div>
          <div className="text-muted-foreground text-sm">Chamados</div>
        </div>
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-red-300">{stats.troubleshoots}</div>
          <div className="text-muted-foreground text-sm">Troubleshoots</div>
        </div>
      </div>

      {/* Actions */}
      <div className="terminal-card p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Ações de Backup</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={exportAllData}
            className="terminal-button h-auto p-4 flex flex-col items-center space-y-2"
          >
            <Download className="h-6 w-6" />
            <span>Exportar Backup</span>
            <span className="text-xs opacity-70">Salvar todos os dados</span>
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importAllData}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={importing}
            />
            <Button 
              disabled={importing}
              className="terminal-button h-auto p-4 flex flex-col items-center space-y-2 w-full"
            >
              <Upload className="h-6 w-6" />
              <span>{importing ? 'Importando...' : 'Importar Backup'}</span>
              <span className="text-xs opacity-70">Restaurar dados salvos</span>
            </Button>
          </div>

          <Button 
            onClick={clearAllData}
            variant="destructive"
            className="h-auto p-4 flex flex-col items-center space-y-2"
          >
            <RotateCcw className="h-6 w-6" />
            <span>Limpar Dados</span>
            <span className="text-xs opacity-70">Remover tudo</span>
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="terminal-card p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Instruções</h3>
        
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>
            <strong className="text-primary">Exportar Backup:</strong>
            <p>Salva todos os seus dados (favoritos, comandos personalizados, circuitos, chamados e troubleshoots) em um arquivo JSON.</p>
          </div>
          
          <div>
            <strong className="text-primary">Importar Backup:</strong>
            <p>Restaura dados de um arquivo de backup. Todos os dados atuais serão substituídos.</p>
          </div>
          
          <div>
            <strong className="text-primary">Limpar Dados:</strong>
            <p>Remove permanentemente todos os dados salvos. Use com cuidado!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;