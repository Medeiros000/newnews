# **📰 New News \- FEED DE NOTÍCIAS AUTO-ATUALIZADO**

**Grupo:** Vinícius • Júnior • Jair • Thais • João

# **💡 Nossa ideia**

Desenvolver um site de notícias auto-atualizado, onde os usuários possam criar uma conta, escolher categorias de interesse e acompanhar notícias de temas como futebol, tecnologia, games, entretenimento, política e mundo.  
As notícias serão atualizadas por meio de uma API, com cadastro de usuários e pesquisa utilizando banco de dados e Docker.

# **📌 Requisitos Funcionais**

* **Cadastro de usuário:** permitir cadastro com nome, e-mail e senha.  
* **Login:** permitir acesso utilizando e-mail e senha.  
* **Visualização de notícias:** exibir título, imagem, resumo, data e categoria.  
* **Categorias:** Futebol, Esportes, Tecnologia, Games, Comida, Entretenimento, Música, Política, Economia, Brasil e Mundo.  
* **Filtro:** permitir filtrar notícias por categoria.  
* **Pesquisa:** permitir pesquisar notícias por palavras-chave.  
* **Atualização:** buscar notícias automaticamente através de uma API.  
* **Acesso à notícia:** permitir acessar a página completa da notícia.  
* **Favoritos:** permitir que usuários logados salvem e visualizem notícias favoritas.  
* **Monitoramento:** registrar interações do usuário com as notícias para auxiliar na personalização.  
* **Perfil:** permitir que o usuário visualize e gerencie suas informações e preferências.

# **⚙️ Requisitos Não Funcionais**

* **Desempenho:** As notícias devem carregar rapidamente, sem deixar o usuário esperando. A pesquisa e o filtro por categorias devem apresentar os resultados rapidamente.  
* **Segurança:** Os dados cadastrados pelos usuários devem ser protegidos. As senhas devem ser armazenadas de forma criptografada. Apenas o próprio usuário deve conseguir acessar seus dados e favoritos.  
* **Usabilidade:** O site deve ter uma interface simples e fácil de navegar. As categorias devem ficar organizadas e fáceis de encontrar. As notícias devem apresentar título, imagem, resumo e data de publicação de forma clara.  
* **Responsividade:** O feed deve funcionar corretamente em computadores, celulares e tablets. O layout deve se adaptar a diferentes tamanhos de tela.  
* **Atualização:** O sistema deve buscar notícias atualizadas automaticamente através da API. As notícias devem ser organizadas de acordo com suas categorias.  
* **Confiabilidade:** O sistema deve evitar mostrar notícias duplicadas. Caso a API fique indisponível, o site deve informar o usuário de forma adequada.

# **💻 Diretrizes de Desenvolvimento**

## **1\. Branches**

* Todas as branches devem ter nomes em inglês.  
* Toda nova branch deve ser criada a partir da main atualizada.  
* O nome deve representar a tarefa.  
* **Exemplos:** `feat/login`, `feat/register`, `feat/favorites`, `feat/user-profile`

## **2\. Commits**

* Todos os commits devem ser escritos em inglês.  
* Utilizar mensagens claras e objetivas.  
* **Exemplos:** `feat: add login page`, `fix: correct user validation`, `style: update header`, `refactor: organize user service`, `docs: update project documentation`

## **3\. Código**

* Todos os identificadores devem ser escritos em inglês, incluindo: Classes, IDs, Componentes, Variáveis, Funções, Arquivos, Pastas, Métodos, Props, Estados.  
* **Exemplos:** `login-form`, `user-profile`, `getUserData()`

## **4\. Fluxo de desenvolvimento**

*main*  
 *↓*  
*Criar branch*  
 *↓*  
*Desenvolver e testar*  
 *↓*  
*PR → develop*  
 *↓*  
*Revisão por outro integrante*  
 *↓*  
*Merge na develop*  
 *↓*  
*Testar na develop*  
 *↓*  
*PR → main (somente quando o líder autorizar)*  
 *↓*  
*Revisão*  
 *↓*  
*Merge na main*

## **5\. Pull Requests**

* Todo PR deve ser enviado primeiro para `develop`.  
* O código deve ser testado após entrar na `develop`.  
* Depois de aprovado e testado, a `develop` poderá ser enviada para a `main`.  
* Nenhum integrante pode aprovar ou realizar sozinho o merge do próprio PR.  
* Todo PR deve ser revisado e aprovado por outra pessoa do grupo.

## **6\. Testes**

* Toda funcionalidade deve ser testada antes do PR.  
* Após o merge na `develop`, deve ser testada novamente.  
* Erros encontrados devem ser corrigidos antes do envio para a `main`.  
* A `main` deve conter somente código revisado e testado.

## **7\. Organização**

* Manter arquivos e pastas organizados.  
* Não enviar arquivos desnecessários.  
* Remover `console.log` utilizados apenas para testes.  
* Evitar código comentado sem necessidade.  
* Priorizar componentes reutilizáveis.  
* Resolver conflitos antes da aprovação do PR.

.  
