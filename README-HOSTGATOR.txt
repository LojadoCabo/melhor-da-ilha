========================================================================
GUIA DE INSTALAÇÃO NO CPANEL HOSTGATOR (NODE.JS) — MELHOR DA ILHA
========================================================================

Este pacote já está totalmente compilado para produção e pronto para uso.

CONTEÚDO DO ZIP:
- dist/         -> Todos os arquivos estáticos e páginas compiladas (HTML/CSS/JS/Imagens)
- server.js     -> Servidor Express rápido em ESM pronto para HostGator
- package.json  -> Lista de dependências do servidor
- .env.example  -> Exemplo de variáveis de ambiente

------------------------------------------------------------------------
PASSO A PASSO NO CPANEL DA HOSTGATOR:
------------------------------------------------------------------------

1. NO CPANEL, ACESSE "CONFIGURAR APLICATIVO NODE.JS" (Setup Node.js App):
   - Clique no botão "+ CRIAR APLICATIVO" (Create Application).
   - Node.js Version: Selecione 18.x, 20.x ou superior.
   - Application Mode: "Production".
   - Application Root: a pasta onde o app ficará (ex: "app" ou "melhordailha").
   - Application URL: o seu domínio ou subdomínio (ex: meudominio.com.br).
   - Application Startup File: digite: server.js
   - Clique em "CREATE" (Criar).

2. ENVIAR OS ARQUIVOS:
   - Abra o "Gerenciador de Arquivos" do cPanel.
   - Entre na pasta que você definiu como "Application Root" (ex: /app).
   - Envie este arquivo .zip e clique com o botão direito nele -> "Extract" (Extrair aqui).
   - Certifique-se de que a pasta "dist", o arquivo "server.js" e o "package.json"
     fiquem diretamente dentro da pasta raiz do aplicativo.

3. INSTALAR AS DEPENDÊNCIAS:
   - Volte na tela "Setup Node.js App".
   - Clique na sua aplicação criada.
   - Clique no botão "Run NPM Install" (ou execute `npm install --omit=dev` pelo Terminal).

4. VARIÁVEIS DE AMBIENTE (OPCIONAL):
   - No painel da aplicação, em "Environment variables", adicione:
     • NODE_ENV = production
     • PORT = (o cPanel define automaticamente através do Passenger)
     • MERCADO_PAGO_ACCESS_TOKEN = seu_token_aqui (se for usar pagamentos)
     • GEMINI_API_KEY = sua_chave_aqui (se for usar IA Gemini)

5. REINICIAR:
   - Clique em "RESTART" no topo do painel do aplicativo.
   - Abra o seu domínio no navegador. Seu site estará no ar!

Em caso de dúvidas, consulte o suporte da HostGator informando que seu
aplicativo usa Node.js com arquivo de inicialização `server.js`.
========================================================================
