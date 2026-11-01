# 🛡️ Rage Store: Bot de Ativação Automática de Licenças

## 📌 Visão geral

Uma integração segura com o Discord, feita em Node.js, que automatiza o cadastro de clientes e a validação de
licenças dos softwares da **Rage Store**.

Em vez de criar contas manualmente, o bot funciona como uma ponte entre o servidor da comunidade no Discord e a
**API do KeyAuth**. Assim, os próprios usuários resgatam com segurança as chaves de licença que compraram e criam
suas contas sem complicação.

## 🚀 Impacto no negócio

* **Ativação sem intervenção manual:** elimina a necessidade de um administrador agir depois de cada venda.
  O cliente compra a chave, usa um comando (`/registerkey`) e ganha acesso ao software na hora.
* **Arquitetura para vários aplicativos:** um loop de verificação valida a licença em mais de um software
  (por exemplo, `ragestore` e `painelragePRO`), e é fácil adicionar novos produtos.
* **Mais segurança:** os dados enviados são validados para impedir ataques de injeção, e as interações temporárias
  do Discord garantem que senhas e chaves nunca apareçam em canais públicos.

## 🛠️ Destaques técnicos

* **Stack:** Node.js, `discord.js` (v14) e `axios` para as requisições HTTP.
* **Integração com API:** integração completa com a API REST do KeyAuth, cuidando da abertura de sessão (INIT)
  e do fluxo de cadastro de usuários com criptografia.
* **Segurança das credenciais:** segue boas práticas usando `dotenv` para manter segredos, tokens do Discord e IDs
  de proprietário fora do código.
* **Tratamento de erros assíncronos:** estruturas `try-catch` e validação das respostas da API para lidar bem com
  sessões expiradas ou dados inválidos.

## 💡 Como funciona por dentro

1. O usuário abre o formulário (Modal) do Discord por meio de um comando.
2. O bot valida o que foi digitado e abre uma sessão criptografada com o servidor do KeyAuth.
3. Um loop testa a chave validada em cada uma das linhas de produto configuradas.
4. Depois da validação, a conta do usuário é criada e o vínculo com o hardware (HWID) fica pronto para o primeiro
   uso do software.
