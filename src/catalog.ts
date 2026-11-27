export const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const

export type Example = {
  id: string
  phrase: string
  meaning: string
  usage: string
}

export type Language = {
  id: 'en' | 'es' | 'it' | 'de' | 'fr'
  name: string
  portuguese: string
  city: string
  lessonTitle: string
  examples: readonly Example[]
  references: readonly { label: string; url: string }[]
}

export const languages: readonly Language[] = [
  {
    id: 'en', name: 'English', portuguese: 'Inglês', city: 'Londres', lessonTitle: 'Primeiros encontros',
    examples: [
      { id: 'en-hello', phrase: 'Hello, I’m Clara.', meaning: 'Olá, eu sou a Clara.', usage: 'Use “I’m” seguido do seu nome para se apresentar.' },
      { id: 'en-meet', phrase: 'Nice to meet you.', meaning: 'Prazer em conhecer você.', usage: 'Diga logo depois que alguém se apresentar.' },
      { id: 'en-morning', phrase: 'Good morning, Alex.', meaning: 'Bom dia, Alex.', usage: 'Use “Good morning” para cumprimentar alguém pela manhã.' },
    ],
    references: [
      { label: 'British Council · Expressões úteis no A1', url: 'https://learnenglish.britishcouncil.org/free-resources/speaking/a1' },
      { label: 'Cambridge English · Atividades de aprendizagem', url: 'https://www.cambridgeenglish.org/learning-english/activities-for-learners/' },
    ],
  },
  {
    id: 'es', name: 'Español', portuguese: 'Espanhol', city: 'Sevilha', lessonTitle: 'Um encontro na praça',
    examples: [
      { id: 'es-hello', phrase: 'Hola, me llamo Inés.', meaning: 'Olá, meu nome é Inés.', usage: 'Use “me llamo” antes do nome ao se apresentar.' },
      { id: 'es-meet', phrase: 'Mucho gusto.', meaning: 'Muito prazer.', usage: 'Responda assim a uma apresentação, em situações formais ou informais.' },
      { id: 'es-morning', phrase: 'Buenos días, Diego.', meaning: 'Bom dia, Diego.', usage: 'Em espanhol, “buenos días” está no plural.' },
    ],
    references: [{ label: 'Instituto Cervantes · Plan curricular', url: 'https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/' }],
  },
  {
    id: 'it', name: 'Italiano', portuguese: 'Italiano', city: 'Florença', lessonTitle: 'Uma apresentação no café',
    examples: [
      { id: 'it-hello', phrase: 'Ciao, mi chiamo Lucia.', meaning: 'Oi, meu nome é Lucia.', usage: '“Ciao” é informal. “Mi chiamo” introduz seu nome.' },
      { id: 'it-meet', phrase: 'Piacere!', meaning: 'Prazer!', usage: 'Uma resposta curta para quando alguém se apresentar.' },
      { id: 'it-morning', phrase: 'Buongiorno, signora.', meaning: 'Bom dia, senhora.', usage: '“Buongiorno” é adequado ao cumprimentar alguém em um contexto mais formal.' },
    ],
    references: [
      { label: 'ALMA Edizioni · Catálogo pedagógico', url: 'https://www.almaedizioni.it/' },
      { label: 'Rai Scuola · Italiano para estrangeiros', url: 'https://www.raiscuola.rai.it/italianoperstranieri' },
    ],
  },
  {
    id: 'de', name: 'Deutsch', portuguese: 'Alemão', city: 'Berlim', lessonTitle: 'Um novo colega',
    examples: [
      { id: 'de-hello', phrase: 'Hallo, ich heiße Lea.', meaning: 'Olá, meu nome é Lea.', usage: '“Ich heiße” significa “me chamo”. Observe a letra ß em “heiße”.' },
      { id: 'de-meet', phrase: 'Freut mich.', meaning: 'Prazer em conhecer você.', usage: 'Use essa expressão breve depois que a outra pessoa disser seu nome.' },
      { id: 'de-morning', phrase: 'Guten Morgen, Emil.', meaning: 'Bom dia, Emil.', usage: '“Guten Morgen” é um cumprimento para o início do dia.' },
    ],
    references: [
      { label: 'Goethe-Institut · Treine seu alemão', url: 'https://www.goethe.de/ins/br/pt/spr/ueb.html' },
      { label: 'Deutsche Welle · Cursos de alemão', url: 'https://learngerman.dw.com/en/learn-german/s-9528' },
    ],
  },
  {
    id: 'fr', name: 'Français', portuguese: 'Francês', city: 'Paris', lessonTitle: 'Um primeiro contato',
    examples: [
      { id: 'fr-hello', phrase: 'Bonjour, je m’appelle Camille.', meaning: 'Olá, meu nome é Camille.', usage: 'Use “je m’appelle” antes de dizer seu nome.' },
      { id: 'fr-meet', phrase: 'Ravi de vous rencontrer.', meaning: 'Prazer em conhecer você.', usage: '“Vous” é uma escolha polida ao falar com alguém que você acaba de conhecer. Escreva “ravie” no feminino.' },
      { id: 'fr-morning', phrase: 'Salut, Noé !', meaning: 'Oi, Noé!', usage: 'Use “salut” com pessoas com quem você já tem familiaridade.' },
    ],
    references: [{ label: 'Didier FLE · Catálogo pedagógico', url: 'https://didierfle.com/' }],
  },
]

export const qecr = {
  label: 'Conselho da Europa · Descritores do QECR',
  url: 'https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions',
}
