import { useState } from 'react';
import { ChevronDown, ChevronRight, Wrench, AlertTriangle, CheckCircle, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TroubleshootStep {
  comando?: string;
  descricao: string;
  esperado?: string;
}

interface TroubleshootItem {
  id: string;
  titulo: string;
  categoria: string;
  severidade: 'alta' | 'media' | 'baixa';
  descricao: string;
  sintomas: string[];
  passos: TroubleshootStep[];
  equipamentos: string[];
}

const troubleshootData: TroubleshootItem[] = [
  {
    id: 'l2vc-down',
    titulo: 'L2VC Down',
    categoria: 'MPLS',
    severidade: 'alta',
    descricao: 'Virtual Circuit L2VPN em estado down, afetando conectividade entre sites.',
    sintomas: [
      'Status do VC mostra "DOWN"',
      'Perda de conectividade entre sites',
      'Pacotes não atravessam o túnel MPLS'
    ],
    passos: [
      {
        comando: 'show l2vpn atom vc',
        descricao: 'Verificar status geral dos VCs',
        esperado: 'VC deve estar UP/UP'
      },
      {
        comando: 'show mpls ldp neighbor',
        descricao: 'Confirmar sessões LDP ativas',
        esperado: 'Estado "Oper" para neighbors'
      },
      {
        comando: 'ping mpls l2vpn vcid [VC-ID]',
        descricao: 'Testar conectividade end-to-end do VC'
      },
      {
        comando: 'show interface [interface]',
        descricao: 'Verificar status da interface física',
        esperado: 'Interface UP/UP'
      },
      {
        descricao: 'Verificar configuração de encapsulamento em ambos os lados'
      },
      {
        descricao: 'Confirmar VC-ID e endereços IP de peers'
      }
    ],
    equipamentos: ['Cisco', 'Huawei']
  },
  {
    id: 'vlan-mismatch',
    titulo: 'Mismatch de VLAN',
    categoria: 'L2',
    severidade: 'media',
    descricao: 'Incompatibilidade de VLANs entre equipamentos ou interfaces.',
    sintomas: [
      'Conectividade intermitente',
      'Alguns hosts não comunicam',
      'Logs de VLAN mismatch'
    ],
    passos: [
      {
        comando: 'show vlan',
        descricao: 'Listar VLANs configuradas',
        esperado: 'VLAN deve existir e estar ativa'
      },
      {
        comando: 'show interface trunk',
        descricao: 'Verificar VLANs permitidas no trunk'
      },
      {
        comando: 'show interface [interface] switchport',
        descricao: 'Confirmar modo da interface (access/trunk)'
      },
      {
        descricao: 'Verificar configuração de VLAN em ambos os lados'
      },
      {
        descricao: 'Confirmar encapsulamento dot1q se necessário'
      }
    ],
    equipamentos: ['Cisco', 'Huawei', 'Datacom']
  },
  {
    id: 'bgp-peer-idle',
    titulo: 'Peer BGP Idle',
    categoria: 'BGP',
    severidade: 'alta',
    descricao: 'Peer BGP não estabelece sessão, permanecendo em estado Idle.',
    sintomas: [
      'Estado BGP mostra "Idle"',
      'Rotas não são recebidas/anunciadas',
      'Conectividade de routing afetada'
    ],
    passos: [
      {
        comando: 'show ip bgp summary',
        descricao: 'Verificar status geral dos peers BGP',
        esperado: 'Estado "Established" para peers ativos'
      },
      {
        comando: 'show ip bgp neighbors [IP]',
        descricao: 'Detalhes específicos do peer problemático'
      },
      {
        comando: 'ping [IP-do-peer]',
        descricao: 'Testar conectividade IP básica',
        esperado: 'Ping deve funcionar'
      },
      {
        comando: 'telnet [IP-do-peer] 179',
        descricao: 'Verificar porta BGP (179) acessível'
      },
      {
        descricao: 'Verificar AS number configurado'
      },
      {
        descricao: 'Confirmar source interface/endereço'
      },
      {
        descricao: 'Verificar filtros de rota aplicados'
      }
    ],
    equipamentos: ['Cisco', 'Huawei']
  },
  {
    id: 'encap-failure',
    titulo: 'Falha de Encapsulamento',
    categoria: 'L2VPN',
    severidade: 'media',
    descricao: 'Problemas com encapsulamento de frames em túneis L2VPN.',
    sintomas: [
      'Pacotes não são encapsulados corretamente',
      'Contadores de erro aumentando',
      'Conectividade L2 intermitente'
    ],
    passos: [
      {
        comando: 'show l2vpn atom vc detail',
        descricao: 'Verificar detalhes do encapsulamento VC'
      },
      {
        comando: 'show mpls forwarding-table',
        descricao: 'Confirmar labels MPLS corretos'
      },
      {
        comando: 'show interface [interface] | include errors',
        descricao: 'Verificar contadores de erro da interface'
      },
      {
        descricao: 'Verificar MTU configurado em ambos os lados'
      },
      {
        descricao: 'Confirmar tipo de encapsulamento (ethernet, vlan, etc.)'
      },
      {
        descricao: 'Verificar controle de palavra (control word)'
      }
    ],
    equipamentos: ['Cisco', 'Huawei']
  },
  {
    id: 'mpls-label-issue',
    titulo: 'Problema de Labels MPLS',
    categoria: 'MPLS',
    severidade: 'alta',
    descricao: 'Labels MPLS incorretos ou não distribuídos adequadamente.',
    sintomas: [
      'LSPs não funcionam corretamente',
      'Pacotes MPLS são descartados',
      'Conectividade MPLS falha'
    ],
    passos: [
      {
        comando: 'show mpls ldp bindings',
        descricao: 'Verificar distribuição de labels LDP'
      },
      {
        comando: 'show mpls forwarding-table',
        descricao: 'Confirmar entradas na tabela MPLS'
      },
      {
        comando: 'show mpls ldp discovery',
        descricao: 'Verificar descoberta de neighbors LDP'
      },
      {
        comando: 'show ip cef [destino]',
        descricao: 'Confirmar resolução CEF para destino'
      },
      {
        descricao: 'Verificar configuração de LDP em interfaces'
      },
      {
        descricao: 'Confirmar router-id LDP único'
      }
    ],
    equipamentos: ['Cisco', 'Huawei']
  },
  {
    id: 'ospf-neighbor-down',
    titulo: 'OSPF Neighbor Down',
    categoria: 'OSPF',
    severidade: 'media',
    descricao: 'Adjacência OSPF não se estabelece ou cai constantemente.',
    sintomas: [
      'Estado OSPF não chega a "Full"',
      'LSAs não são sincronizados',
      'Rotas OSPF ausentes'
    ],
    passos: [
      {
        comando: 'show ip ospf neighbor',
        descricao: 'Verificar estado das adjacências',
        esperado: 'Estado "Full" para neighbors'
      },
      {
        comando: 'show ip ospf interface',
        descricao: 'Confirmar configuração OSPF da interface'
      },
      {
        comando: 'show ip ospf database',
        descricao: 'Verificar base de dados OSPF'
      },
      {
        descricao: 'Verificar área OSPF configurada'
      },
      {
        descricao: 'Confirmar hello/dead timers compatíveis'
      },
      {
        descricao: 'Verificar autenticação OSPF se configurada'
      },
      {
        descricao: 'Confirmar MTU da interface'
      }
    ],
    equipamentos: ['Cisco', 'Huawei']
  }
];

const TroubleshootingGuide = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getSeverityColor = (severidade: string) => {
    switch (severidade) {
      case 'alta': return 'bg-red-500/20 text-red-300';
      case 'media': return 'bg-yellow-500/20 text-yellow-300';
      case 'baixa': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getSeverityIcon = (severidade: string) => {
    switch (severidade) {
      case 'alta': return <AlertTriangle className="h-4 w-4" />;
      case 'media': return <Wrench className="h-4 w-4" />;
      case 'baixa': return <CheckCircle className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  const categories = ['all', ...new Set(troubleshootData.map(item => item.categoria))];
  
  const filteredData = selectedCategory === 'all' 
    ? troubleshootData 
    : troubleshootData.filter(item => item.categoria === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center">
          <Wrench className="h-8 w-8 mr-3" />
          Guia de Troubleshooting
        </h1>
        <p className="text-muted-foreground mt-1">
          Soluções para problemas comuns em redes NOC N2
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="terminal-button"
          >
            {category === 'all' ? 'Todas' : category}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{filteredData.length}</div>
          <div className="text-muted-foreground text-sm">Problemas</div>
        </div>
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-red-300">
            {filteredData.filter(item => item.severidade === 'alta').length}
          </div>
          <div className="text-muted-foreground text-sm">Alta Severidade</div>
        </div>
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-300">
            {filteredData.filter(item => item.severidade === 'media').length}
          </div>
          <div className="text-muted-foreground text-sm">Média Severidade</div>
        </div>
        <div className="terminal-card p-4 text-center">
          <div className="text-2xl font-bold text-accent">
            {new Set(filteredData.map(item => item.categoria)).size}
          </div>
          <div className="text-muted-foreground text-sm">Categorias</div>
        </div>
      </div>

      {/* Troubleshooting Items */}
      <div className="space-y-4">
        {filteredData.map((item) => (
          <div key={item.id} className="terminal-card">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/10"
              onClick={() => toggleExpanded(item.id)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {expandedItems.has(item.id) ? (
                    <ChevronDown className="h-5 w-5 text-primary" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-primary" />
                  )}
                  {getSeverityIcon(item.severidade)}
                </div>
                
                <div>
                  <h3 className="font-semibold text-primary text-lg">
                    {item.titulo}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.descricao}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="outline">{item.categoria}</Badge>
                <Badge className={getSeverityColor(item.severidade)}>
                  {item.severidade.toUpperCase()}
                </Badge>
              </div>
            </div>

            {expandedItems.has(item.id) && (
              <div className="border-t border-border p-4 space-y-4">
                {/* Sintomas */}
                <div>
                  <h4 className="font-semibold text-primary mb-2">Sintomas Comuns:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {item.sintomas.map((sintoma, index) => (
                      <li key={index}>{sintoma}</li>
                    ))}
                  </ul>
                </div>

                {/* Equipamentos */}
                <div>
                  <h4 className="font-semibold text-primary mb-2">Equipamentos:</h4>
                  <div className="flex space-x-2">
                    {item.equipamentos.map(equip => (
                      <Badge key={equip} variant="outline">{equip}</Badge>
                    ))}
                  </div>
                </div>

                {/* Passos de Troubleshooting */}
                <div>
                  <h4 className="font-semibold text-primary mb-3">Passos de Troubleshooting:</h4>
                  <div className="space-y-3">
                    {item.passos.map((passo, index) => (
                      <div key={index} className="bg-muted/20 rounded p-3 border-l-4 border-accent">
                        <div className="flex items-start space-x-3">
                          <div className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            {passo.comando && (
                              <div className="mb-2">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Terminal className="h-4 w-4 text-primary" />
                                  <span className="text-primary font-semibold">Comando:</span>
                                </div>
                                <code className="bg-card text-primary font-mono text-sm px-2 py-1 rounded">
                                  {passo.comando}
                                </code>
                              </div>
                            )}
                            <p className="text-card-foreground text-sm mb-2">
                              {passo.descricao}
                            </p>
                            {passo.esperado && (
                              <p className="text-green-300 text-sm">
                                <strong>Esperado:</strong> {passo.esperado}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8">
          <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhum problema encontrado para a categoria selecionada.
          </p>
        </div>
      )}
    </div>
  );
};

export default TroubleshootingGuide;