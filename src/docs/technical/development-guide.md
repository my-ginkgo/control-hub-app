
# 🚀 Guida allo Sviluppo

## 🛠️ Setup Ambiente di Sviluppo

1. **Prerequisiti**
   - Node.js (versione 18 o superiore)
   - npm o yarn
   - Git

2. **Installazione**
   ```bash
   # Clona il repository
   git clone <repository-url>

   # Installa le dipendenze
   npm install

   # Avvia il server di sviluppo
   npm run dev
   ```

## 📝 Convenzioni di Codice

### Componenti React

- Utilizzare function components con TypeScript
- Hooks personalizzati in `/src/hooks`
- Componenti UI riutilizzabili in `/src/components/ui`
- File di stile con Tailwind CSS

### TypeScript

- Definire interfacce per props dei componenti
- Utilizzare type inference quando possibile
- Evitare `any`
- Definire tipi in `/src/types`

### Gestione Stato

- Utilizzare TanStack Query per chiamate API
- useState per stato locale
- Evitare prop drilling utilizzando context quando necessario

### Supabase

- Utilizzare il client Supabase da `/src/integrations/supabase/client`
- Implementare Row Level Security per ogni tabella
- Gestire errori nelle chiamate al database

## 🧪 Testing

- Implementare test unitari per componenti critici
- Test di integrazione per flussi principali
- Coverage minimo richiesto: 70%

## 📦 Build e Deploy

1. **Build**
   ```bash
   npm run build
   ```

2. **Preview locale**
   ```bash
   npm run preview
   ```

3. **Deploy**
   - Deploy automatico tramite CI/CD
   - Ambiente di staging per test
   - Ambiente di produzione per release

## 🔍 Debugging

- Console di sviluppo React
- Chrome DevTools
- Supabase Dashboard per database e auth

