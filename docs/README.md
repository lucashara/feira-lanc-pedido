# feira-lanc-pedido

## Identificação
- Tipo: Frontend (Vite + JS vanilla)
- Status: Desativado em 20/08/2026, arquivado em `_DESATIVADOS` (ver Desativação e reativação)

## Área e setor
- Área responsável: TI
- Setor atendido: Comercial

## Objetivo
Frontend de **lançamento de pedidos** da feira interna **Experiência 360** do Grupo BRF1, usado por fornecedores e vendedores autorizados. Após autenticação via Cognito, o usuário busca o cliente por CNPJ, preenche os dados do pedido e o sistema valida regras de negócio (faixa de valor mínima/máxima, limite de moedas em até 30% do valor) antes de enviar para a API.

## Necessidade que originou
Sem essa interface, lançamentos da feira eram feitos em sistemas dispersos, sem validação local de regras. Era preciso aplicar as regras de negócio ainda no frontend (faixa de valor, limite de moedas) e oferecer uma busca rápida por CNPJ, evitando devoluções da API por dado inválido.

## Como acessar / executar
- Modo: SPA estática servida por Nginx durante a feira
- Caminho de execução: `C:\Projetos\feira-lanc-pedido`
- Build local: `npm run build`
- Endpoint da API: `https://api.grupobrf1.com:10000`
- Serviço Windows / NSSM: Não se aplica (frontend estático)
- Logs: logs do Nginx do host

## Stack e integrações
- Build: Vite
- Linguagem: JavaScript vanilla
- Estilo: HTML/CSS + Bootstrap
- Autenticação: Amazon Cognito
- Sistemas integrados: API da campanha BRF1 (`Auth-BRF1`) · endpoints `consultarclienteporcnpj` e `lancarpedido`

## Inovação e avanço técnico
- **Regras de negócio aplicadas no cliente** (valor mínimo/máximo, limite de moedas a 30% do valor) reduzem rejeição da API
- Busca de cliente por CNPJ preenche automaticamente o formulário
- Reuso da identidade visual padrão da feira

## Incertezas / desafios técnicos
- Manter as regras do frontend em sincronia com o backend (regras dobradas)
- Política de retentativa em falha do Cognito
- Sazonalidade: ativo apenas durante edições da feira

## Resultados / ganhos
- Lançamento de pedidos da feira centralizado e validado no frontend
- Mesmo template reaproveitável em próximas edições
- Não mensurado formalmente

## Equipe
- Responsável técnico: TI

## Desativação e reativação

Desativado em 20/08/2026 e arquivado em `C:\Projetos\_DESATIVADOS\feira-lanc-pedido`.

**Motivo**

Frontend de uso pontual em edição de feira, sem serviço nem bloco Nginx no servidor.

**Para reativar**

1. Mover a pasta de volta para `C:\Projetos\feira-lanc-pedido`.
2. Rodar `yarn install` e `yarn build`.

**Deploy pelo GitHub Actions**

O workflow `main_feira-lanc-pedido.yml`, que publicava no Azure Web App, está desabilitado desde
20/08/2026: o GitHub reprova a execução automaticamente porque o workflow usa
`actions/upload-artifact@v3`, descontinuado. Ele falhava a cada push e disparava aviso por e-mail.
Para voltar, corrigir a causa e rodar `gh workflow enable main_feira-lanc-pedido.yml -R grupobrf1/feira-lanc-pedido`.
