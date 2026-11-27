import { languages } from './catalog'
import type { Card, LanguageId } from './study'

function trackCards(trackId: string, rows: [string, string][]): Card[] {
  return rows.map(([phrase, meaning], index) => ({ id: `${trackId}-${index + 1}`, phrase, meaning }))
}

export const frenchTracks = [
  {
    id: 'fr-bases', title: 'Francês · Básica', description: 'Compras, pedidos e direções.',
    cards: trackCards('fr-bases', [
      ['Je cherche la gare.', 'Estou procurando a estação.'],
      ['Vous avez du pain ?', 'Vocês têm pão?'],
      ['C’est combien, s’il vous plaît ?', 'Quanto custa, por favor?'],
      ['Un thé sans sucre, merci.', 'Um chá sem açúcar, por favor.'],
      ['La pharmacie est à gauche.', 'A farmácia fica à esquerda.'],
      ['Je prends le métro à huit heures.', 'Eu pego o metrô às oito horas.'],
    ]),
  },
  {
    id: 'fr-intermediaire', title: 'Francês · Intermediária', description: 'Relatar experiências e fazer planos.',
    cards: trackCards('fr-intermediaire', [
      ['Quand je suis arrivé, le café était encore fermé.', 'Quando cheguei, o café ainda estava fechado.'],
      ['J’ai réservé une table pour demain soir.', 'Reservei uma mesa para amanhã à noite.'],
      ['On pourrait visiter le musée s’il pleut.', 'Podemos visitar o museu se chover.'],
      ['J’y retourne chaque fois que je viens en ville.', 'Volto lá sempre que venho à cidade.'],
      ['Je n’ai pas encore reçu la confirmation.', 'Ainda não recebi a confirmação.'],
      ['Si tu veux, je peux t’accompagner.', 'Se você quiser, posso ir com você.'],
    ]),
  },
  {
    id: 'fr-avance', title: 'Francês · Avançada', description: 'Nuances, hipóteses e argumentação.',
    cards: trackCards('fr-avance', [
      ['Quoi qu’il arrive, nous maintiendrons la rencontre.', 'Aconteça o que acontecer, manteremos o encontro.'],
      ['Encore faut-il que chacun puisse s’exprimer.', 'É preciso ainda que todos possam se expressar.'],
      ['Il n’en demeure pas moins que la question reste ouverte.', 'Ainda assim, a questão continua em aberto.'],
      ['Si j’avais su, je m’y serais pris autrement.', 'Se eu soubesse, teria feito de outro jeito.'],
      ['Pour peu qu’on lui laisse du temps, elle trouvera une solution.', 'Basta que lhe deem um pouco de tempo para que ela encontre uma solução.'],
      ['À en juger par sa réaction, la nouvelle l’a surpris.', 'A julgar pela reação dele, a notícia o surpreendeu.'],
    ]),
  },
] as const

export function academyCards(language: LanguageId): readonly Card[] {
  return languages.find(item => item.id === language)?.examples ?? []
}

export function writingCards(language: LanguageId): readonly Card[] {
  const base = academyCards(language)
  return language === 'fr' ? [...base, ...frenchTracks[0].cards, ...frenchTracks[1].cards, ...frenchTracks[2].cards] : base
}
