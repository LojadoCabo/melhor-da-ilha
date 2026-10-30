# Plano de Implementação: Funcionalidade de Edição de Negócio

Este documento descreve as etapas para permitir que empresários editem suas informações de negócio no MELHOR DA ILHA.

## 1. Autenticação e Segurança
- **Verificação de Acesso**: Somente o proprietário do negócio (verificado via e-mail ou WhatsApp cadastrado no banco de dados) poderá editar.
- **Fluxo**:
  - Usuário clica no link de edição.
  - Se não estiver logado, redireciona para login (via e-mail ou WhatsApp).
  - Após login, o sistema verifica se o e-mail/WhatsApp do usuário logado corresponde ao `ownerWhatsapp` ou `email` do registro da empresa no Firestore.

## 2. Interface de Edição (UI)
- **Novo componente**: `EditBusinessModal.tsx` ou página dedicada `/editar-empresa`.
- **Campos editáveis**:
  - Nome, Slogan, Descrição.
  - Links (Instagram, Facebook, Website, Google Maps).
  - Telefones (WhatsApp principal).
  - Fotos (Upload de fotos para galeria ou substituição da imagem de capa).
  - Vídeos (Campo para inserir link de vídeo, ex: YouTube/TikTok).

## 3. Lógica de Banco de Dados (Firestore)
- **Leitura**: Buscar o documento da empresa baseado no ID passado no link.
- **Escrita**: Utilizar `setDoc` ou `updateDoc` no Firebase Firestore para persistir as alterações.
- **Armazenamento de Mídia**: (Se necessário) Adicionar lógica para lidar com o upload de novas fotos (ex: Firebase Storage, se habilitado, ou manter o padrão atual de strings de URL).

## 4. Próximos Passos (Verificação)
- [ ] Implementar a verificação de autorização (usuário vs empresa).
- [ ] Criar o formulário de edição com validação.
- [ ] Implementar a função `updateBusiness` na camada de serviço.
- [ ] Testar a edição em ambiente de desenvolvimento.
