# Testni primeri

## TC-RW-001: Registracija novega uporabnika
**Področje:** Avtentikacija

**Namen:** Preveriti ali je registracija novega uporabnika na spletni strani uspešna.

**Predpogoji:**
- Uporabnik še ni registriran v sistem.
- Nahaja se na strani za registracijo.

**Vhodni podatki:**
- Podatki novega uporabnika (uporabniško ime, email, geslo).

**Koraki:**

|  |Akcija|Pričakovan razultat|
|--|---|---|
|1.|V vnosno polje Email vnesemo testni email.|V vnosnem polju vidimo vnešen email.|
|2.|V vnosno polje Username vnesemo testno uporabniško ime.|V vnosnem polju vidimo vnešeno uporabniško ime.|
|3.|V vnosno polje Password vnesemo testno geslo.|V vnosnem polju vidimo črne pikice (zakrito geslo).|
|4.|Kliknemo gumb Register.|Preusmerjeni smo na domačo stran aplikacije. V zgornjem desnem kotu je zapisano uporabniško ime.|


## TC-RW-002: Ustvarjanje novega recepta
**Področje:** Recepti (CRUD)

**Namen:** Preveriti ali lahko uporabnik doda nov recept.

**Predpogoji:**
- Uporabnik je prijavljen v sistem
- Nahaja se na strani svojega profila.

**Vhodni podatki:**
- Podatki novega recepta (naslov, opis, sestavine, koraki).

**Koraki:**

|  |Akcija|Pričakovan razultat|
|--|---|---|
|1.|Kliknemo gumb + Add Recipe.|Odpre se modalno okno za vnos recepta.|
|2.|V vnosno polje Title vnesemo testni naslov recepta.|V vnosnem polju vidimo vnešen naslov.|
|3.|V vnosno polje Description vnesemo testni opis recepta.|V vnosnem polju vidimo vnešen opis.|
|4.|V vnosno polje Ingridients vnesemo testne sestavine, vsako v svojo vrstico.|V vnosnem polju vidimo vnešene sestavini, vsako v svoji vrstici.|
|5.|V vnosno polje Steps vnesemo testne korake, vsakega v svojo vrstico.|V vnosnem polju vidimo vnešene korake, vsakega v svoji vrstici.|
|6.|Kliknemo gumb Create recipe.|Modalno okno se zapre, novi recept se pojavi na našem profilu.|


## TC-RW-003: Iskanje in filtriranje receptov
**Področje:** Iskanje in filtriranje

**Namen:** Preveriti ali iskalnik vrne recepte izbranega avtorja.

**Predpogoji:**
- Uporabnik je prijavljen v sistem
- Nahaja se na domači strani.
- Uporabnik "bob" ima ustvarjen vsaj 1 recept.

**Vhodni podatki:**

**Koraki:**

|  |Akcija|Pričakovan razultat|
|--|---|---|
|1.|V sekciji iskalnika kliknemo na spustni meni All authors.|Odpre se spustni meni z vsemi avtorji.|
|2.|Kliknemo na avtorja z imenom bob.|Oznaka All authors se spremeni v bob in prikažejo se recepti, kjer je kot avtor navedeno "by bob"|


## TC-RW-004: Dodajanje recepta med zaznamke
**Področje:** Zaznamki

**Namen:** Preveriti ali lahko uporabnik doda recept v zaznamke.

**Predpogoji:**
- Uporabnik je prijavljen v sistem
- Nahaja se na strani s podrobnostmi o receptu.
- V sistemu je dodan testni recept, ki še ni dodan med zaznamke

**Vhodni podatki:**

**Koraki:**

|  |Akcija|Pričakovan razultat|
|--|---|---|
|1.|Kliknemo gumb Add to bookmarks.|Gumb spremeni ozadje v belo ter tekst v Bookmarked.|
|2.|V navigacijski vrstici kliknemo na podstran My Bookmarks.|Odpre se stran z vsemi recepti dodanimi med zaznamke. Vidimo testi recept.|


## TC-RW-005: Sledenje drugemu avtorju
**Področje:** Sledenje

**Namen:** Preveriti ali lahko uporabnik začne slediti drugemu avtorju

**Predpogoji:**
- Uporabnik je prijavljen v sistem
- Nahaja se na profilni strani avtorja test2.

**Vhodni podatki:**

**Koraki:**

|  |Akcija|Pričakovan razultat|
|--|---|---|
|1.|Kliknemo gumb Follow.|Gumb spremeni ozadje v belo ter tekst v Following.|
|2.|V navigacijski vrstici kliknemo na podstran My Profile.|Odpre se naša profilna stran. V okencu Following piše ime testnega avtorja @test2|



















