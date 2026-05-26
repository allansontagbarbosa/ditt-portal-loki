# Plano de reescrita — Portal Lojista (multi-loja)

Mantém design system, tipografia e layout atuais. Mexe só em hooks, types, rotas e adiciona tela `/faturas` + seletor de loja.

---

## 1) SQL (rodar no projeto admin / banco — eu não tenho acesso `psql` aqui)

Entrego os scripts; você aplica via migration no admin.

### 1.1 `portal_lojas_do_grupo()` — NOVA
Exatamente o SQL que você mandou. Sem alterações.

### 1.2 `portal_detalhe_ordem(p_ordem_id uuid)` — VERIFICAR / CRIAR
Precisa que você confirme via:
```sql
SELECT proname FROM pg_proc WHERE proname='portal_detalhe_ordem';
```
Se não existir, crio com a lógica:
- Resolve `v_grupo_id` via `lojista_grupos` (mesmo padrão das outras).
- Garante que `os.aparelho_id IN (SELECT a.id FROM aparelhos a JOIN clientes c ON c.id=a.cliente_id WHERE c.grupo_id=v_grupo_id)`.
- Retorna `{ ordem: {...campos pedidos..., aparelho, cliente:{id,nome}, garantia, timeline} }` ou `{ error: 'Ordem não encontrada' }`.

### 1.3 `portal_dashboard_lojista()` — PATCH
No `jsonb_agg` de `ultimas_ordens` adicionar `'cliente_nome', c.nome` (join `aparelhos`→`clientes`). Sem alterar mais nada do shape.

### 1.4 `portal_meu_perfil()` — NOVA (opcional, recomendado)
Retorna `{ grupo:{...}, user_email, lojas:[{id,nome,telefone,email,endereco,qtd_aparelhos,qtd_os}] }`.

### 1.5 `portal_atualizar_meu_perfil(...)` — NOVO SHAPE
Aceitar `p_nome, p_razao_social, p_cnpj_matriz, p_email, p_telefone, p_responsavel, p_observacoes` e fazer UPDATE em `lojista_grupos` onde `user_id=auth.uid()`.

---

## 2) Arquivos do front (paths)

### NOVOS
- `src/hooks/useMinhasOrdens.ts`
- `src/hooks/useMinhasFaturas.ts`
- `src/hooks/useLojasDoGrupo.ts`
- `src/hooks/useMeuPerfilGrupo.ts`
- `src/hooks/useOrdemDetalhe.ts` (substitui o atual)
- `src/lib/portal-rpc.ts` — helper único `callRpc<T>(fn, args)` que trata `{error}` como erro (substitui `success===true`)
- `src/routes/_authenticated/faturas.tsx`
- `src/components/LojaBadge.tsx` — chip compacto reutilizável
- `src/components/LojaSelector.tsx` — dropdown "Todas as lojas / Loja X"

### ALTERADOS
- `src/hooks/useDashboardLojista.ts` — novo shape (`saldo.faturado/pago`, `grupo_nome`, `ultimas_ordens[].cliente_nome`), sem `success`
- `src/hooks/useExtratoFinanceiro.ts` — `movimentos[]`, `resumo`, sem `success`, sem `direcao`
- `src/hooks/useMinhasGarantias.ts` — novo shape com `resumo`, `cliente_nome`, `ordem_numero`, `aparelho` aninhado, sem `success`
- `src/hooks/useMeuPerfil.ts` — DELETAR (substituído por `useMeuPerfilGrupo`)
- `src/hooks/useAtualizarMeuPerfil.ts` — novo payload do grupo
- `src/hooks/useOrdensLojista.ts` — DELETAR
- `src/routes/_authenticated/dashboard.tsx` — "Grupo {grupo_nome}", KPI lojas, card "Minhas Lojas", últimas ordens com badge de loja
- `src/routes/_authenticated/ordens.tsx` — usa `useMinhasOrdens`, paginação por `total`, filtro de status (todos os status novos), filtro por loja
- `src/routes/_authenticated/ordens_.$id.tsx` — usa novo shape `ordem.cliente.nome`, `ordem.garantia`, `ordem.timeline`
- `src/routes/_authenticated/financeiro.tsx` — `resumo` + `movimentos`, badge de loja, períodos 30/60/90/180
- `src/routes/_authenticated/garantias.tsx` — KPIs do `resumo`, filtros (loja, status, busca por OS#), cliente_nome
- `src/routes/_authenticated/perfil.tsx` — Card Grupo + Card Conta (trocar senha via `supabase.auth.resetPasswordForEmail`) + grid de lojas
- `src/components/OSCard.tsx` — adiciona `<LojaBadge nome={cliente_nome}/>`
- `src/components/Layout.tsx` — adicionar link "Faturas" no menu (entre Financeiro e Garantias)
- `src/lib/formatters.ts` — expandir `statusInfo` com `recebido, em_analise, aprovado, em_reparo, aguardando_peca, pronto, entregue, cancelado` (mantém cores atuais)

---

## 3) Resumo de mudanças-chave por arquivo

### `src/lib/portal-rpc.ts` (NOVO)
```ts
export async function callRpc<T>(fn: string, args?: object): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args ?? {});
  if (error) throw new Error(error.message);
  if (data && typeof data === "object" && "error" in data && typeof (data as any).error === "string") {
    throw new Error((data as any).error);
  }
  return data as T;
}
```
Todos os hooks passam a usar `callRpc` — fim do `success===true`.

### `useDashboardLojista`
```ts
export interface DashboardResponse {
  saldo: { faturado: number; pago: number; devedor: number };
  ordens: { total: number; entregues: number; canceladas: number };
  garantias_ativas: number;
  ultimas_ordens: Array<{ id; numero; numero_formatado; status; valor; data_entrada; defeito_relatado; marca; modelo; cliente_nome }>;
  grupo_id: string; grupo_nome: string;
  cliente_id: string; cliente_nome: string; // aliases
}
```
Hook = `callRpc<DashboardResponse>("portal_dashboard_lojista")`.

### `useMinhasOrdens` (NOVO)
```ts
useMinhasOrdens({ status?, limit=50, offset=0 }) // queryKey inclui os 3 params
→ callRpc("portal_minhas_ordens", { p_status, p_limit, p_offset })
→ { ordens, total }
```

### `useMinhasFaturas` (NOVO)
`callRpc("portal_minhas_faturas", { p_limit, p_offset })` → `{ resumo, faturas, pagamentos }`.

### `useLojasDoGrupo` (NOVO)
`callRpc("portal_lojas_do_grupo")` → `{ lojas: [...] }`. Usado no Dashboard, seletor de loja e tela /perfil.

### `useExtratoFinanceiro`
Novo type:
```ts
{ resumo:{faturado,pago,devedor}, periodo_dias, movimentos:[{tipo:'fatura'|'pagamento', data, valor, descricao, ordem_numero?, forma_pagamento?, cliente_nome}] }
```
Derivar `direcao` na UI: `tipo==='pagamento' ? 'credito' : 'debito'`.

### `useMinhasGarantias`
Novo type com `resumo` + `garantias[].cliente_nome` + `aparelho` aninhado. Retorna o objeto inteiro (não só array) pra dashboard usar `resumo`.

### `useOrdemDetalhe` (reescrito)
`callRpc("portal_detalhe_ordem", { p_ordem_id })` → `{ ordem }`. Type com `cliente:{id,nome}`, `garantia|null`, `timeline:[]`.

### `useMeuPerfilGrupo` (NOVO) + `useAtualizarMeuPerfil` (novo payload)
Substitui inteiro o legado `get_my_cliente_lojista` (que falha pra Isabela).

### `dashboard.tsx`
- Header: "Grupo **{grupo_nome}**" + subline "{lojas.length} lojas".
- KPIs: Faturado / Pago / Devedor (do `saldo`) — **renomeia leitura** mas mantém visual.
- Card **Minhas lojas**: grid das lojas (`useLojasDoGrupo`) com faturado/devedor por loja.
- Últimas ordens: cada card recebe `<LojaBadge>` com `os.cliente_nome`.
- Atalhos adiciona `/faturas`.

### `ordens.tsx`
- `LojaSelector` no topo (filtra client-side por `cliente_id`).
- Dropdown de status (8 opções pedidas + "todas").
- `OSCard` ganha badge de loja.
- Paginação básica: `total` da RPC, `limit=50`, botões "anterior/próxima" (`offset` em search param).

### `ordens_.$id.tsx`
- Header com `<LojaBadge>` (`ordem.cliente.nome`).
- Timeline visual a partir de `ordem.timeline` (4 dots).
- Card Garantia condicional (`ordem.garantia`).
- Botões Aprovar/Reprovar quando `status==='aguardando_aprovacao' && !aprovacao_orcamento`.

### `financeiro.tsx`
- KPIs do `resumo`.
- Períodos: 30/60/90/180.
- Cada `movimento` mostra `<LojaBadge>` + badge tipo (verde pagamento, vermelho fatura). Click em fatura → `/ordens/$id` se `ordem_numero` mapeado (RPC precisa expor `ordem_id`; se não tiver, só sheet de detalhe).

### `faturas.tsx` (NOVO)
Tabs Em aberto / Pagas / Pagamentos. Colunas conforme spec. Paginação via search params.

### `garantias.tsx`
- Strip de KPIs (`resumo`).
- Filtros: loja (LojaSelector), status (ativa/encerrada), input busca por OS#.
- Dias_restantes em amarelo se `<30`.

### `perfil.tsx`
- Card "Dados do Grupo" (editável via `useAtualizarMeuPerfil`).
- Card "Conta": email + botão "Trocar senha" → `supabase.auth.resetPasswordForEmail(email, { redirectTo: '<origin>/reset-password' })`.
- Card "Minhas lojas": grid das 5 lojas com qtd_os.

### `Layout.tsx`
Adiciona item "Faturas" (ícone `Receipt`) no nav entre Financeiro e Garantias.

### `formatters.ts`
`statusInfo` ganha os 8 status novos com cores consistentes com as atuais.

---

## 4) Ordem de aplicação (depois da sua aprovação)

1. Criar `portal-rpc.ts` + `LojaBadge` + `LojaSelector`.
2. Reescrever hooks (dashboard, ordens, financeiro, garantias, ordem-detalhe, faturas, lojas-do-grupo, meu-perfil-grupo).
3. Reescrever rotas na ordem: dashboard → ordens → ordem-detalhe → financeiro → garantias → perfil.
4. Criar rota `/faturas` + adicionar no Layout.
5. Atualizar `formatters.ts`.
6. Apagar hooks legados (`useOrdensLojista`, `useMeuPerfil`).

---

## 5) Pendências que dependem de você

- **(a)** Rodar `SELECT proname FROM pg_proc WHERE proname IN ('portal_detalhe_ordem','portal_meu_perfil','portal_atualizar_meu_perfil')` e me dizer quais existem.
- **(b)** Aplicar no banco: `portal_lojas_do_grupo` (nova), patch em `portal_dashboard_lojista` (adicionar `cliente_nome` em `ultimas_ordens`), e (se faltarem) `portal_detalhe_ordem`, `portal_meu_perfil`, novo `portal_atualizar_meu_perfil`.
- **(c)** Confirmar nomes exatos dos status no enum `status_ordem` (uso a lista que você mandou: recebido, em_analise, aprovado, em_reparo, aguardando_peca, pronto, entregue, cancelado).

Aprovar este plano para eu começar a aplicar no front?
