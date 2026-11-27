# Minerva — Academia Linguarium

A versão 0.2 oferece amostras A1 em cinco idiomas, trilhas de francês, flashcards com pronúncia sintética, leitura, decks de escrita e criação de decks com imagens e áudio. [Abrir a Minerva](https://gllmntvn.github.io/minerva-academia-linguarium/)

O histórico, as revisões e os decks podem ser usados sem conta e ficam no navegador e dispositivo em uso. O histórico da conta é sincronizado quando o Supabase está configurado. Os decks com mídia permanecem no navegador. Nenhuma mídia particular é enviada ao servidor.

## Primeiro teste

No **Laboratório**, escolha **Francês**, abra o **Deck de escrita** e selecione uma carta para praticar. Confira a resposta e avalie a carta. Abra **Histórico de estudo e estatísticas** pelo Meu estúdio e confira a atividade. Recarregue a página e verifique que ela continua ali.

## Compilar no Cloud

Com Node.js 24, execute os comandos a partir da raiz do checkout.

```sh
npm ci
npm test
npm run build
npm run preview
```

O GitHub Pages publica o diretório `dist/` pelo fluxo manual em `.github/workflows/pages.yml`. Os áudios de estudo são arquivos MP3 gerados com eSpeak NG a partir das frases originais de Minerva. A criação de decks permite anexar mídias de sua autoria.

## Ativar contas e histórico sincronizado

1. Em um projeto Supabase autorizado, habilite o provedor de e-mail e aplique a migração em `supabase/migrations/`. Ela só permite que a conta autenticada leia e registre seus próprios eventos.
2. Configure a URL pública da Minerva em **Authentication → URL Configuration** e permita os retornos de confirmação e recuperação de senha. O retorno padrão é `https://gllmntvn.github.io/minerva-academia-linguarium/`. O retorno de recuperação termina em `?redefinir=1`.
3. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` nas variáveis do repositório GitHub e publique novamente. O valor da chave deve começar com `sb_publishable_`. A compilação não usa chave privada.
4. Prepare duas contas fictícias em um ambiente de teste. Faça uma lição com a primeira e confira o histórico após entrar novamente. A segunda conta deve ter seu próprio histórico.

Enquanto o projeto Supabase não estiver configurado, a tela **Conta** explica como usar o histórico local. [Escopo e publicação da versão 0.1](docs/publicacao-0.1.md)
