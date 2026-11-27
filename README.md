# Minerva — Academia Linguarium

*The art of language*

Demonstração pública 0.1, feita com React, TypeScript e Vite. A arquitetura de produto inclui Supabase para autenticação por e-mail e senha, banco de dados e armazenamento de mídias. Essa integração fica para a etapa com contas reais. [Abrir demonstração no GitHub Pages](https://gllmntvn.github.io/minerva-academia-linguarium/)

## Experimentar no Cloud

Com Node.js 24, execute os comandos abaixo no ambiente Cloud, a partir da raiz do checkout.

```sh
npm ci
npm test
npm run build
npm run preview
```

Use o endereço servido pelo ambiente Cloud. Nesse primeiro teste, abra **Meu estúdio**, selecione **Alemão**, abra a lição e escolha **Praticar com flashcards**. Revele a primeira carta e avalie como **Fácil**. Abra **Memoria** e confirme que a carta aparece em **Próximas revisões**, com data três dias à frente. Recarregue e confirme que a agenda fica vazia. As escolhas e avaliações valem para a visita atual.

## Estrutura

- `src/catalog.ts` contém as cinco amostras A1, os níveis do QECR e os links de referência.
- `src/main.tsx` reúne as telas, rotas e estado da visita.
- `src/review.ts` agenda e verifica a liberação de cada carta. `tests/` cobre a passagem da data e a liberação imediata.
- `src/style.css` define a identidade aprovada. `public/` contém as ilustrações adaptadas do protótipo e as licenças das fontes.
- `.github/workflows/pages.yml` é a proposta de fluxo manual de publicação.
- [Revisão do protótipo e plano de publicação](docs/publicacao-0.1.md) detalha o escopo, a validação e as etapas sujeitas à aprovação.
