
# Permessi dell'Applicazione

## Ruoli Utente

### ADMIN
- Accesso completo alla gestione degli utenti
- Accesso a tutti i progetti
- Può creare, modificare ed eliminare progetti
- Può assegnare ruoli agli utenti

### USER
- Accesso ai propri progetti
- Può creare nuovi progetti
- Può modificare solo i propri progetti
- Può registrare il proprio tempo sui progetti

## Politiche di Sicurezza (RLS)

### Tabella Projects
- Gli amministratori possono vedere e modificare tutti i progetti
- Gli utenti possono vedere e modificare solo i progetti di cui sono proprietari
- Gli utenti possono vedere i progetti pubblici (is_public = true)

### Tabella Time Entries
- Gli utenti possono vedere e modificare solo le proprie registrazioni di tempo
- Gli amministratori possono vedere tutte le registrazioni di tempo
- Gli utenti possono registrare tempo solo sui progetti a cui hanno accesso

### Tabella User Roles
- Solo gli amministratori possono modificare i ruoli degli utenti
- Gli utenti possono vedere il proprio ruolo

## Autenticazione
- L'accesso richiede un account valido
- Le password devono rispettare i requisiti minimi di sicurezza
- Le sessioni scadono dopo un periodo di inattività

