## TC-RW-001: Registracija novega uporabnika
**Področje:** Avtentikacija

**Namen:** Preveriti ali je registracija novega uporabnika na spletni strani uspešna.

**Predpogoji:**
- Uporabnik še ni registriran v sistem.
- Nahaja se na strani za registracijo.

**Specifikacije:**
- Email mora vsebovati znak “@” in domeno (npr. test@rw.com).
- Uporabniško ime mora biti dolgo med 3 in 20 znaki.
- Geslo mora biti dolgo med 8 in 20 znaki.

**Ekvivalenčne kategorije:**
|Polje|Veljavni primeri|Neveljavni primeri|
|--|---|---|
|Email|vsebuje “@” in domeno (npr. test@rw.com)|brez @ ali brez domene (npr. testrw.com, test@)|
|Username|dolžina med 3 in 20|manj kot 3 ali več kot 20 znakov|
|Password|dolžina vsaj 6|manj kot 6 znakov|

**Mejne vrednosti:**
|Polje|Dolžina|Status|
|--|---|---|
|Username|2|Neveljavno|
|Username|3|Veljavno|
|Username|20|Veljavno|
|Username|21|Neveljavno|
|Password|5|Neveljavno|
|Password|6|Veljavno|

**Vhodni podatki:**
- Podatki novega uporabnika:
  - Email: test@recipe-world.com
  - Uporabniško ime: Test
  - Geslo: test123

**Koraki:**

|  |Akcija|Pričakovan razultat|Dejanski rezultat|Status|
|--|---|---|---|---|
|1.|V vnosno polje Email vnesemo testrecipeworld.com (brez @)|Vnosno polje se obarva rdeče - napačen vnos|||
|2.|Vnosno polje Email počistimo|Vidimo prazno vnosno polje Email|||
|3.|V vnosno polje Email vnesemo test@ (brez domene)|Vnosno polje se obarva rdeče - napačen vnos|||
|4.|Vnosno polje Email počistimo|Vidimo prazno vnosno polje Email|||
|5.|V vnosno polje Email vnesemo testni email.|Vnosno polje se obarva zeleno - pravilen vnos, vidimo vnešen email.|||
|6.|V vnosno polje Username vnesemo uporabniško ime te|Vnosno polje se obarva rdeče - napačen vnos|||
|7.|Vnosno polje Username počistimo|Vidimo prazno vnosno polje Username|||
|8.|V vnosno polje Username vnesemo uporabniško ime testtesttesttesttestt|Vnosno polje se obarva rdeče - napačen vnos|||
|9.|Vnosno polje Username počistimo|Vidimo prazno vnosno polje Username|||
|10.|V vnosno polje Username vnesemo uporabniško ime tes|Vnosno polje se obarva zeleno - pravilen vnos, vidimo vnešeno uporabniško ime.|||
|11.|Vnosno polje Username počistimo|Vidimo prazno vnosno polje Username|||
|12.|V vnosno polje Username vnesemo uporabniško ime testtesttesttesttest|Vnosno polje se obarva zeleno - pravilen vnos, vidimo vnešeno uporabniško ime.|||
|13.|Vnosno polje Username počistimo|Vidimo prazno vnosno polje Username|||
|14.|V vnosno polje Username vnesemo testno uporabniško ime.|Vnosno polje se obarva zeleno - pravilen vnos, vidimo vnešeno uporabniško ime.|||
|15.|V vnosno polje Password vnesemo geslo testt|Vnosno polje se obarva rdeče - napačen vnos|||
|16.|Vnosno polje Password počistimo|Vidimo prazno vnosno polje Password|||
|17.|V vnosno polje Password vnesemo geslo testte|Vnosno polje se obarva zeleno - pravilen vnos, vidimo črne pikice (zakrito geslo).|||
|18.|Vnosno polje Password počistimo|Vidimo prazno vnosno polje Password|||
|19.|V vnosno polje Password vnesemo testno geslo.|Vnosno polje se obarva zeleno - pravilen vnos, vidimo črne pikice (zakrito geslo).|||
|20.|Kliknemo gumb Register.|Preusmerjeni smo na domačo stran aplikacije. V zgornjem desnem kotu je zapisano uporabniško ime.|||

**Pogoj uspešnega zaključka:** Uporabnik je registriran in lahko dostopa do funkcionalnosti, ki so namenjene samo za registrirane uporabnike (dodajanje receptov, dodajanje receptov med zaznamke, sledenje drugim avtorjem).
