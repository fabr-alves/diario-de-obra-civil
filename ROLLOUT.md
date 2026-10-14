# Imagens, mapa e autoria

## Implementação

- Ortofoto de outubro em WebP: 4096 × 2893, 2.917.706 bytes (original: 49.705.928 bytes). A proporção é preservada, sem recorte.
- Novas fotos: limite de 1600 pixels no maior lado, miniatura de 320 pixels e carregamento sob demanda no histórico. Fotos antigas continuam compatíveis e não são regravadas.
- Fabrício (UID configurado em `app-utils.mjs`) vê **Atualizar mapa**. A seleção é otimizada e exibida antes da confirmação. O upload vai para um nome único em `mapas/`; só depois do upload a transação altera `app_settings/map`. Falhas preservam o mapa vigente. O registro guarda o endereço anterior.
- Novos diários guardam `createdBy`, `createdAt`, `updatedBy`, `updatedAt` e `authorId`. Edições e movimentação de pontos atualizam apenas o último editor. Não se infere um criador para registros legados: o código anterior sobrescrevia `authorId` nas edições.
- Rascunhos são separados por UID. O rascunho global legado não é atribuído automaticamente a outro usuário e permanece no armazenamento local antigo.

## Pendente antes da produção

O console autenticado apresentou **Erro ao carregar versões das regras**. As regras publicadas ainda precisam ser obtidas e revisadas; esta branch não está pronta para merge. Não substituir regras existentes sem ler e preservar o escopo atual.

1. Conferir as regras atuais de Firestore e Storage e a identidade do administrador.
2. Em Firestore, permitir leitura de `app_settings/map` aos usuários existentes autorizados e escrita somente ao UID administrativo. Validar o endereço do próprio bucket, dimensões, versão, `updatedBy.uid == request.auth.uid` e `updatedAt == request.time`.
3. Em Storage, permitir criação de imagens em `mapas/` somente ao administrador, com tipo JPEG/PNG/WebP e tamanho até 10 MB. O app não precisa apagar/sobrescrever mapas. Preservar as regras existentes das fotos, permitindo WebP se necessário.
4. Para diários novos, validar autoria contra a sessão e timestamps contra o horário do servidor. Em atualizações, manter criador, horário de criação e `authorId` imutáveis, validar o editor e permitir a atualização de registros legados sem inventar autoria histórica. Verificar compatibilidade com abas antigas do aplicativo antes de ativar exigências de novos campos.
5. Testar permissões no emulador/console: leitura autorizada, mapa negado a usuário comum, mapa permitido ao administrador, autor forjado negado, criação/edição legítimas permitidas e registro legado preservado.
6. Validar upload, publicação e leitura da configuração com Firebase real. O teste de navegador já feito usa adaptadores locais, não comprova permissões remotas.
7. Só então publicar a branch e confirmar o deploy de produção.

## Verificação local realizada

- `node tests/app-utils.test.mjs`: autoria imutável no payload de edição, legado, isolamento das chaves de rascunho, limites de dimensão e remoção de campos não permitidos do formulário.
- JSX compilado com Babel.
- Navegador com Firebase simulado: carregar mapa, selecionar ortofoto de 47,4 MiB, otimizar para 2,4 MiB, prévia, confirmação e publicação; enviar foto com miniatura; criar como Fabrício e editar como Lucas preservando o criador; botão administrativo ausente para Lucas; nenhum erro de console nesses fluxos.

## Limites

As marcações continuam nas coordenadas percentuais atuais; trocar o enquadramento da planta pode exigir reposicionamento. Os históricos de alterações completos, importação de funcionários por Excel e migração das fotos antigas ficam fora desta alteração.
