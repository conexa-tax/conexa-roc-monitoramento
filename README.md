# CONEXA ROC/CBS — captura de painel público

Projeto independente, sem dados de clientes e sem arquivos do site CONEXA. Usa GitHub Actions agendado e GitHub Pages na pasta `/docs`.

## Configuração

1. Faça upload dos diretórios `.github`, `automacao-roc` e `docs` (mantendo as pastas) na raiz do repositório.
2. Settings > Actions > General > Workflow permissions: selecione **Read and write permissions** (se disponível) e salve.
3. Settings > Pages > Build and deployment > Source: **Deploy from a branch** > Branch: `main` (ou `principal`, conforme o repositório) > Folder: **/docs** > Save.
4. Actions > Capturas públicas ROC / CBS > Run workflow. Confira logs antes de confiar na atualização.
5. Abra o endereço GitHub Pages indicado em Settings > Pages.

O relatório pode alterar seus controles, impedir navegação ou bloquear carregamento automático. A rotina falha sem publicar dados novos quando ocorre erro de captura. A data de captura não é a data da base da Receita. Repositório público: não adicionar senhas, credenciais ou arquivos de clientes.

O HUB da Cloudflare **não passa a exibir estas imagens automaticamente** com este pacote isolado: será necessário apontar a próxima versão do HUB para a URL pública do GitHub Pages ou do manifesto.
