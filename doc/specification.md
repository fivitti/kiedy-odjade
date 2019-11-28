---
title: Kiedy odjadę?
subtitle: Programowanie aplikacji GNSS
author: |
  | Sławomir Figiel
  | 179355
  | Politechnika Gdańska
date: 28-11-2019
abstract: Celem projektowanego systemu będzie wspieranie dynamicznego przemieszczana się po obszarze Trójmiasta. Pozwoli na błyskawiczny podgląd odjazdów pojazdów komunikacji miejskiej z najbliższy przystanków.
classoption: twocolumn
papersize: a4paper
lang: pl-PL

---

# Wymagania

## Wymagania funkcjonalne

1. Określanie najbliższych przystanków na podstawie lokalizacji GPS
2. Obliczanie dystansu do przystanku
3. Wyświetlanie najbliższych przystanków posortowanych po odległości
4. Wyświetlanie najbliższych odjazdów dla każdego przystanku
   - Numer linii
   - Spodziewana godzina odjazdu
   - Liczba minut pozostałych do odjazdu
   - Kierunek linii
5. Automatyczna, periodyczna aktualizacja danych
6. Wymuszona manualnie aktualizacja danych
7. Przechowywanie informacji o przystankach w trwałej pamięci podręcznej
8. Możliwość przypięcia aplikacji do ekranu domowego na urządzeniach przenośnych

## Wymagania niefunkcjonalne

1. Minimalizacja użycia transferu
2. Szybkie uruchamianie
3. Czytelna obsługa błędów umożliwiająca użytkownikowi rozwiązywanie problemów
4. Przetwarzanie danych lokalizacyjnych wyłącznie na urządzeniu użytkownika
5. Obsługa zarówno stacjonarnych jak i mobilnych systemów operacyjnych (w tym iOS)

## Szkic interfejsu 

~~~~~ {.ditaa .encoding:UTF-8}

+---------------------------------------------+
|                   Jak dojadę?               |
+---------------------------------------------+
+--------------+-----------------------+------+
| Kręta        |                       | 225m |
+--------------+-----------------------+------+
|                                             |
|  +-----+----------------+--------+-------+  |
|  | 199 | Dworzec główny | 9 min  | 22꞉20 |  |
|  +-----+----------------+--------+-------+  |
|  | 168 | Kiełpino górne | 21 min | 22꞉33 |  |
|  +-----+----------------+--------+-------+  |
|                                             |
+--------------+-----------------------+------+
| Siedlicka    |                       | 232m |
+--------------+-----------------------+------+
|                                             |
|  +-----+----------------+--------+-------+  |
|  | 199 | Oliwa PKP      | 2 min  | 22꞉20 |  |
|  +-----+----------------+--------+-------+  |
|  | 168 | Wrzeszcz PKP   | 13 min | 22꞉32 |  |
|  +-----+----------------+--------+-------+  |
|                                             |
+---------------------------------------------+
|                                             |
|  +--------------+                           |
|  | Odśwież dane |                           |
|  +--------------+                           |
|                                             |
+---------------------------------------------+

~~~~~

# Wstępna analiza systemowa

Opracowywany system musi cechować się szybkością działania i wsparciem dla wielu platform. Z tego powodu zdecydowano o zaimplementowaniu go w postaci strony internetowej. Pozwoli to na dostęp do niego z dowolnego urządzenia wyposażonego w przeglądarkę internetową.  
Dane potrzebne do funkcjonowania aplikacji udostępniane są przez publiczne API systemu Otwarty ZTM. Nie wspiera on jednak mechanizmu CORS (Cross-Origin Resource Sharing) i protokołu HTTPS na wszystkich punktach dostępowych co uniemożliwia dostęp do nich dynamiczny dostęp z poziomu przeglądarki użytkownika. Potrzebne będzie rozwiązanie pośredniczące w komunikacji z systemem ZTMu, które doda wsparcie dla brakujących rozwiązań.  
Jednocześnie w trosce o prywatność użytkowników i wysoką dostępność systemu postanowiono zrezygnować z dedykowanego przetwarzania po stronie serwera. Obliczenia związane z lokalizacją będą wykonywane wyłącznie po stronie przeglądarki użytkownika. Będzie ona komunikować się z systemem ZTMu (przez serwer pośredniczący), a następnie samodzielnie obrabiać je i prezentować użytkownikowi.  
Przedstawione podejście może być zrealizowane z użyciem rozwiązań dedykowanym tzw. Progressive Web Apps. Dzięki temu projektowany system może powstać użycia zewnętrznych bibliotek lub z minimalną ich liczbą. Powinno to ograniczyć rozmiar wynikowej aplikacji i pozwolić na uzyskanie dużej szybkości ładowania i działania.

~~~~~ {.ditaa}

+-------------------+     +----------------------+     +--------------------------------------+
| Serwer statyczny  |     |  Serwer dynamiczny   |     |             Otwarty ZTM              |
+-------------------+     +----------------------+     +--------------------------------------+
| +---------------+ |     | +------------------+ |     | +---------------+ +----------------+ |
| | Aplikacja WWW | |     | | CORS/HTTPS Proxy |---------| HTTP Endpoint | | HTTPS Endpoint | |
| +------+--------+ |     | +---------+--------+ |     | +---------------+ +-------+--------+ |
+--------|----------+     +-----------|----------+     +---------------------------|----------+
         |                            |                                            |
         |                            |                                            |
         |                            |                                            |
         |                            |                                            |
         |                            |                                            |
         |               +------------+-------------+                              |
         \---------------+ Przeglądarka internetowa +------------------------------/
                         +--------------------------+
~~~~~