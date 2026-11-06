# +Gás — integração futura com OnSpace Cloud / Supabase

Esta versão é uma demonstração frontend. Não activa autenticação, base de dados, geolocalização, SMS, pagamentos, uploads ou pedidos reais. Todas as transições e os valores apresentados são ilustrativos. Nunca efectuar transferências a partir desta aplicação.

## Contratos de dados

As interfaces em `src/types/index.ts` representam products, zones, drivers, orders, addresses e availability_reports. Os valores demonstrativos estão em `src/constants/data.ts`; os adaptadores estão em `src/lib/api.ts` e `src/lib/auth.ts`. O contexto em `src/hooks/useApp.tsx` mantém o estado e a persistência local da experiência demonstrativa. Na integração deverá consumir os adaptadores substituídos, em vez de confiar em dados do navegador.

- products: id, size (6 | 12 | 51), name, price (inteiro em Kz). Inserir preços oficiais validados; os valores actuais não são oficiais.
- zones: id, province, name, delivery_fee, availability (available | low | unavailable). Taxas fixas configuradas directamente na base de dados.
- profiles: id de auth.users, name, phone, role (customer | driver), apenas estes dois papéis.
- drivers: id de profiles, name, phone, rating, plate, approval_status (pending | approved | rejected), rejection_reason; acrescentar identity, vehicle, document paths e training completion. O estado é editado manualmente por uma ligação privilegiada à base de dados. Nunca fornecer permissão de aprovação ao entregador. Não existe painel Admin.
- addresses: id, customer_id, label, street, reference, zone_id e coordenadas geográficas reais. O pin actual usa percentagens num mapa ilustrativo, não latitude/longitude.
- orders: id, customer_id, driver_id, product_id, quantity (1 ou 2), zone_id, address snapshot, gas_price, delivery_fee, total, payment_method, status, confirmation_code, created_at, rating, comment. Provas de segurança em armazenamento privado.
- availability_reports: id, driver_id, zone_id, location, availability, created_at. As observações são validadas antes de actualizar disponibilidade agregada.

## Estados

created = criado; searching = à procura; accepted = aceite; buying = a comprar; on_the_way = a caminho; delivered = entregue; cancelled = cancelado; out_of_stock = sem stock.

## Segurança e integridade necessárias

1. RLS: cliente acede apenas aos seus pedidos, perfil e moradas. Entregador lê ofertas permitidas apenas quando aprovado, e altera apenas entregas atribuídas.
2. Calcular e congelar preços, taxas e total no servidor. CHECK quantity between 1 and 2. Não confiar em totais vindos do cliente.
3. Aceitação atómica de pedido com prazo de 20 segundos validado pelo servidor, online e approval_status = approved, sem dupla atribuição.
4. Máquina de estados no servidor e cancelamentos consistentes. Só concluir com checklist, prova privada e código verificado no servidor com limites de tentativas. Não expor o código ao entregador antes da confirmação; a demo expõe-o explicitamente para testar.
5. Auth por telefone com OTP real; papéis associados pelo servidor. Não inferir aprovação pelo número ou pelo papel escolhido na interface.
6. Realtime para mudanças de estado e localização; não usar progressão automática da demo em produção. GPS e mapa dependem de consentimento, cobertura, precisão e fornecedor.
7. Storage privado para BI, carta e documentação da viatura, com URLs assinados, MIME/tamanho verificados e políticas de retenção. Actualmente só nomes de ficheiros são simulados.
8. Integrar Multicaixa com o serviço apropriado; nunca tratar escolha de método como confirmação de pagamento real.
9. Configurar contacto WhatsApp e telefones reais antes do lançamento. Todos os perfis e contactos actuais são de demonstração.
10. Adicionar índices, skeletons ligados a pedidos reais, modo offline, retries controlados e notificações por eventos.
