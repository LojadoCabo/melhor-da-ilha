========================================================================
GUIA DE INSTALAÇÃO NO CPANEL HOSTGATOR (HOSPEDAGEM COMPARTILHADA)
========================================================================

Este pacote já está 100% compilado e configurado para funcionar na
Hospedagem Compartilhada da HostGator (Apache + PHP), SEM precisar de
Node.js, VPS, terminal ou Cloud Functions pago!

CONTEÚDO PRONTO NA RAIZ DO ZIP:
- index.html    -> Página principal compilada do portal
- assets/       -> Estilos CSS, scripts JS e imagens otimizadas
- api.php       -> Motor de API em PHP para Checkout Mercado Pago (Pix e Cartão)
- .htaccess     -> Regras automáticas do Apache para rotas /api/* e páginas

------------------------------------------------------------------------
PASSO A PASSO SIMPLES NO CPANEL DA HOSTGATOR (SEM COMANDOS):
------------------------------------------------------------------------

1. ABRA O GERENCIADOR DE ARQUIVOS NO CPANEL:
   - Entre na pasta do seu domínio (ex: `public_html` ou `melhordailha.online`).

2. ENVIE E EXTRAIA O ARQUIVO ZIP:
   - Clique em "Carregar" (Upload) no topo e envie o arquivo `site.zip`.
   - Volte para a pasta, clique com o botão direito sobre o `site.zip` e
     escolha "Extract" (Extrair).
   - Confirme a extração na própria pasta do domínio.

3. PRONTO!
   - O seu site e o Checkout Mercado Pago já estarão funcionando!
   - Para testar a API, acesse: https://melhordailha.online/api/health
     ou https://melhordailha.online/api.php

------------------------------------------------------------------------
COMO COLOCAR SEU TOKEN REAL DO MERCADO PAGO (OPCIONAL):
------------------------------------------------------------------------
Por padrão, o checkout já gera o QR Code Pix e o código Copia e Cola em
modo demonstração caso nenhum token esteja configurado.
Quando quiser receber pagamentos reais na sua conta Mercado Pago:
1. No Gerenciador de Arquivos do cPanel, clique com o botão direito no
   arquivo `api.php` e escolha "Edit" (Editar).
2. Na linha 25, cole o seu Access Token de produção:
   $CONFIG_MERCADO_PAGO_TOKEN = 'APP_USR-seu-token-aqui';
3. Clique em "Salvar alterações".
========================================================================
