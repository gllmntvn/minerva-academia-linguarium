# Minerva 0.1 — Revisão e plano de publicação

## Pergunta

Uma pessoa consegue explorar a Minerva, experimentar uma lição A1 e entender quando a próxima revisão será liberada, sem fornecer dados pessoais?

A avaliação usa o HTML `minerva_prototipo.html` fornecido, o código desta proposta e testes no Chromium do ambiente Cloud. Os textos e comportamentos do anexo são referências de produto. As instruções deste trabalho vieram do pedido do usuário.

## Fatos observados no protótipo

| Área | Comportamento no HTML | Decisão para a 0.1 proposta |
| --- | --- | --- |
| Identidade | Elmo e louros, ilustração de Minerva, paleta e fontes aprovadas, variações responsivas | Usar a mesma identidade e as ilustrações do anexo. Servir as fontes junto com o site. |
| Navegação | A troca de telas ocorre em memória sem alterar a URL. Recarregar retorna à Home. | Rotas com fragmento para preservar links diretos, botão Voltar e recarga das páginas estáticas em subdiretório. |
| Academia e Laboratório | Há uma matriz de níveis e modalidades, mas várias atividades reutilizam a mesma lista de vocabulário. Os controles de nível e quantidade do Laboratório são ilustrativos. | Oferecer cinco lições curtas A1 com três exemplos originais cada. Leitura tem correção objetiva e flashcards permitem avaliação. A2–C2 aparecem como conteúdo previsto. |
| Memoria | A lógica guarda o intervalo em dias, sem data de vencimento. As cartas agendadas com intervalo positivo deixam de aparecer e o relógio não as libera. | Calcular vencimento usando o relógio, exibir a data e liberar ao chegar o horário. Os intervalos por avaliação são 0, 1, 3 ou 7 dias nesta amostra. |
| Conta, progresso e curadoria | Login, cadastro, recuperação e curadoria são ilustrativos. Há preferências e contadores em memória, além de estatísticas fixas. | Exibir apenas contagens geradas na visita e escolha de idioma. Login, onboarding completo, metas, histórico, perfil, configurações e curadoria permanecem no plano de produto. |
| Mídias e referências | O Scriptorium carrega mídia via URL temporária, sem política de tamanho ou descarte explícito da URL. O HTML solicita fontes ao Google Fonts. A escuta depende de voz disponível no navegador. | Adiar uploads, edição de decks e escuta para validação específica. A Bibliotheca da 0.1 apresenta links pedagógicos. |

## Escopo para aprovação

- Home institucional, Academia, Metodologia e Privacidade.
- Meu estúdio com escolha de idioma e contagens reais da visita.
- Inglês, espanhol, italiano, alemão e francês com uma amostra A1 cada. O plano curricular mantém A1 a C2 do QECR.
- Laboratório com leitura e flashcards. Memoria com liberação por horário enquanto a página permanecer aberta.
- Bibliotheca com referências institucionais. A biblioteca de gramática, vocabulário, literatura e cultura será ampliada nas próximas etapas.
- Cursos, unidades e trilhas temáticas completos, as práticas de escrita, gramática, escuta, conjugação e demais modalidades, e o Scriptorium com criação, edição e exclusão de cartas de texto, imagem e áudio permanecem no escopo da plataforma.

Os exemplos e as explicações foram escritos para a Minerva. Os descritores do Conselho da Europa orientam o objetivo de se apresentar, cumprimentar e identificar fórmulas simples. British Council, Cambridge, Instituto Cervantes, ALMA Edizioni, Rai Scuola, Goethe-Institut, Deutsche Welle e Didier FLE são referências para curadoria e progressão. Os links levam às fontes e nenhum material didático dessas instituições foi incorporado ao site. [Descritores do QECR](https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions)

## Segurança e privacidade

- O artefato estático contém o código público, conteúdo de exemplo e ativos visuais. A demonstração não pede e-mail ou senha, não oferece upload e não armazena dados em cookies ou no armazenamento do navegador. A hospedagem processa requisições HTTP conforme suas próprias práticas.
- A compilação ativa uma política de segurança de conteúdo que limita scripts, estilos, imagens e fontes à origem do site e bloqueia conexões feitas por scripts e envio de formulários. A política usa meta tag, compatível com hospedagem estática. Cabeçalhos da hospedagem serão verificados na URL final.
- O fluxo manual envia apenas `dist/` ao Pages. Sua compilação pode ler o repositório. O job de publicação recebe apenas permissões de Pages e OIDC. As ações estão fixadas por commit e o fluxo executa somente na branch padrão quando acionado manualmente.
- Para a etapa com contas reais, preparar um ambiente Supabase separado com contas de teste fictícias. Validar confirmação de e-mail e recuperação, destinos autorizados, limitação de tentativas e retorno à URL da aplicação. Usar apenas a chave publicável no navegador e manter credenciais privilegiadas no servidor.
- Habilitar RLS nas tabelas de perfil, preferências, progresso, metas, histórico, decks, cartas e revisões. Validar propriedade também nas relações filhas, usar buckets privados com acesso controlado e revisar tipos e tamanho dos arquivos. As funções administrativas devem verificar papéis no servidor ou no banco. Antes de conectar a aplicação a dados reais, testar também anonimamente e com duas contas distintas e demonstrar que uma não consegue consultar ou alterar os dados da outra. [Documentação de RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Hipótese e lacunas

A hipótese da 0.1 é que uma amostra A1 por idioma basta para avaliar navegação, identidade e o ciclo lição → prática → revisão. Um primeiro teste com visitantes pode verificar se eles encontram um idioma, praticam e localizam a data de retorno. A demonstração não instrumenta o comportamento de visitantes.

O repositório de origem da Minerva é privado. A publicação da demonstração depende de o plano da conta permitir GitHub Pages a partir de repositórios privados. Verificar o endereço final do Pages após o deploy. As políticas de acesso do Supabase serão verificadas quando existir um ambiente autorizado para a etapa com contas reais.

O link da ALMA Edizioni retornou redirecionamento inconclusivo no Cloud. Confirmar que ele abre no navegador antes de divulgar. Os demais links chegaram a uma resposta HTTP 200 a partir do ambiente Cloud.

## Validação no Cloud

- No HTML de referência, naveguei da Home até uma lição A1 no desktop e acessei o Scriptorium pelo menu móvel. Avaliei cartas como “Fácil” e adiantei quatro dias no relógio de teste. Elas continuaram indisponíveis.
- Na compilação da 0.1, testei no Chromium larguras de 320, 390 e 1440 px, rotas sob o subdiretório esperado no Pages, os cinco idiomas, leitura, flashcards, voltar, recarregar, rota inválida e foco pelo teclado. A carta continuou futura após dois dias, voltou no terceiro e saiu da fila depois de ser avaliada novamente.
- A auditoria npm retornou zero vulnerabilidades conhecidas no conjunto de dependências consultado. A compilação e os testes de agendamento passaram. Os percursos automatizados registraram zero erros no console, zero arquivos ausentes e zero requisições a terceiros enquanto a pessoa permanece na demonstração.

## Publicação proposta

1. Confirmar o endereço e o acesso ao repositório privado. Inspecionar branch padrão, regras de proteção, conteúdo existente e disponibilidade de Pages no plano da conta.
2. Incorporar a estrutura à branch de trabalho. Apresentar o diff e o escopo da versão. Após aprovação, enviar a branch e preparar a revisão da mudança para integração à branch padrão.
3. Antes de acionar a publicação, confirmar a versão a publicar e obter aprovação para selecionar **GitHub Actions** em **Settings → Pages**, se necessário, e executar manualmente o fluxo que disponibilizará `dist/` ao público. A conta Supabase, dados reais e envios de e-mail ficam fora dessa publicação. [Configuração do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
4. Após a publicação autorizada, abrir a URL retornada pelo GitHub em uma sessão anônima. Conferir Home, rotas diretas, recarga, navegação em largura móvel, ativos, console, links pedagógicos e ausência de chamadas do aplicativo para terceiros. Registrar o SHA e a URL aprovados. Se for necessário retirar a demonstração ou restaurar um artefato anterior, apresentar a mudança para aprovação.
