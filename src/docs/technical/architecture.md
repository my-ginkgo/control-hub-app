
# 🏗️ Architettura del Progetto

## 📁 Struttura delle Cartelle

```
src/
├── components/     # Componenti React riutilizzabili
│   ├── ui/        # Componenti UI di base (button, input, etc.)
│   ├── charts/    # Componenti per grafici e visualizzazioni
│   ├── client/    # Componenti specifici per la gestione clienti
│   ├── docs/      # Componenti per la documentazione
│   ├── layout/    # Componenti di layout (header, sidebar, etc.)
│   ├── project/   # Componenti specifici per i progetti
│   ├── sidebar/   # Componenti della barra laterale
│   └── time-entry/# Componenti per la gestione del tempo
├── docs/          # Documentazione in formato Markdown
├── hooks/         # Custom React hooks
├── integrations/  # Integrazioni con servizi esterni (es. Supabase)
├── lib/           # Librerie e utilità
├── pages/         # Componenti pagina
├── services/      # Servizi per la logica di business
├── types/         # Definizioni TypeScript
└── utils/         # Funzioni di utilità
```

## 🔧 Stack Tecnologico

- **Framework**: React con Vite
- **Linguaggio**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase
- **State Management**: TanStack Query
- **Grafici**: Recharts
- **Routing**: React Router DOM

## 📊 Database Schema

### Tabelle Principali

1. **clients**
   - Gestione anagrafica clienti
   - Campi: id, name, description, is_public, user_id, color

2. **projects**
   - Progetti associati ai clienti
   - Campi: id, name, description, client_id, is_public, user_id, color

3. **time_entries**
   - Registrazioni tempo sui progetti
   - Campi: id, project_id, user_id, hours, billable_hours, notes, date

4. **user_roles**
   - Gestione ruoli utente
   - Campi: id, user_id, role, email, is_disabled

## 🔐 Autenticazione e Autorizzazione

- Gestione autenticazione tramite Supabase Auth
- Ruoli utente: ADMIN e DIPENDENTE
- Policy di accesso ai dati basate su Row Level Security (RLS)

