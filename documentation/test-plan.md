# Testni plan – Recipe World

## 1) Cilj testne faze
Cilje testne faze je preveriti vse ključne funkcionalnosti aplikacije Recipe World (verzija 1.0). Testiranje bo obsegalo osnovne uporabniške akcije.   

## 2) Kontekst testiranja

**Obseg**

* Avtentikacija (registracija, prijava)
* Profili (moj profil, javni profili)
* Recepti (CRUD, seznam, filtriranje/sortiranje)
* Komentarji (dodajanje, prikaz avtorja/datum)
* Zaznamki (dodaj/odstrani, seznam »My Bookmarks«)
* Sledenje (follow/unfollow)

**Okolja**

* Lokalno: Vite, ExpressJS
* Docker: `recipe_world_frontend_image`, `recipe_world_backend_image`

---

## 3) Strategija testiranja

**Pristop**

* **Ročni funkcionalni testi**: registracija, login, create recipe, comment, rate, bookmark, follow, unfollow, remove bookmark.
* **Robni testi**: prazna polja, predolge vrednosti.

---

## 4) Časovnica

| Aktivnost                            | Datum začeteka | Datum konca |
| ------------------------------------ | ------------- | ----------- |
| Priprava testnega okolja  | 1. 10. 2025    | 13. 10. 2025  |
| Oblikovanje testnih primerkov | 13. 10. 2025    | 20. 10. 2025  |
| Izvedba testiranja        | 20. 10. 2025    | 27. 10. 2025  |

---

## 5) Kriteriji zaključka testne faze

* Vsi testi so uspešno opravljeni.
* Ni odprtih **kritičnih** ali **visokih** napak.

---

## 6) Knjižnica testnih primerov

| ID        | Opis                            | Področje       | Pričakovani rezultat                                               |
| --------- | ------------------------------- | -------------- | ------------------------------------------------------------------ |
| TC-RW-001 | Registracija novega uporabnika  | Avtentikacija  | Uporabnik registriran, prijavljen, vidi svoj profil                |
| TC-RW-002 | Ustvarjanje novega recepta      | Recepti (CRUD) | Novi recept prikazan na profilu                                    |
| TC-RW-003 | Iskanje in filtriranje receptov | Iskanje        | Prikazani samo recepti izbranega avtorja                           |
| TC-RW-004 | Dodajanje recepta med zaznamke  | Zaznamki       | Gumb spremeni stanje v Bookmarked, recept se pojavi v My Bookmarks |
| TC-RW-005 | Sledenje drugemu avtorju        | Sledenje       | Gumb spremeni stanje v Following, avtor prikazan v Following listi |
| TC-RW-006 | Dodajanje komentarja            | Komentarji     | Komentar prikazan pod receptom                                     |
| TC-RW-007 | Dodajanje ocene                 | Ocene          | Ocena prikazana v sekciji Ratings                                  |

---

## 7) Odgovornosti

* Načrt in izvedba testov: Matija, Tomas
* Poročilo v orodju Jira: Matija, Tomas















