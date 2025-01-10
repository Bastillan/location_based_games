# PZSP2 - Gra Miejska

## Zespół
- Marcin Sadowski
- Maciej Kaniewski
- Michał Pieńkos
- Jędrzej Kędzierski

## Cel projektu
Celem projektu jest stworzenie aplikacji webowej, która umożliwi Fundacji Bo Warto organizację gier miejskich o dłuższym okresie trwania, dzięki czemu uczestnicy będą mogli brać w nich udział w dogodnym dla siebie czasie. Aplikacja ma na celu ułatwienie zarządzania grami, zmniejszenie zaangażowania wolontariuszy oraz umożliwienie uczestnikom realizowania zadań w wybranym przez siebie terminie, bez konieczności fizycznej obecności w konkretnych godzinach. Kluczowym elementem będzie stworzenie systemu, który pozwala na automatyczne uruchomienie gry na podstawie wcześniej przygotowanego scenariusza, bez potrzeby ciągłej interwencji administratorów. Uczestnicy, po zarejestrowaniu się, będą mogli realizować zadania w określonej kolejności, odwiedzając wyznaczone miejsca i rozwiązując zagadki w różnych formach, takich jak tekst, obraz czy dźwięk. Aplikacja umożliwi również śledzenie postępu gry oraz zapewni administratorom możliwość monitorowania wyników i generowania raportów po zakończeniu wydarzenia. System będzie wymagał rejestracji użytkowników, którzy po ukończeniu gry otrzymają powiadomienie o jej zakończeniu. Celem aplikacji jest zwiększenie dostępności gier miejskich, poprawa efektywności organizacyjnej oraz umożliwienie szerokiemu gronu uczestników angażowania się w te wydarzenia.

## Technologie
- Django
- React
- PostgreSQL

## Uruchomienie aplikacji
Do uruchomienia aplikacji niezbędne jest oprogramowanie Docker. Po sklonowaniu repozytorium należy skopiować pliki:

- `.env.db.sample` i nadać mu nazwę `.env.db.dev`
- `.env.sample` i nadać mu nazwę `.env.dev`

W pliku `.env.dev` należy podmienić w dwóch miejscach `<API_IP>` na adres ip urządzenia, na którym uruchamiamy aplikację oraz ustawić swoje dane dla aplikacji, takie jak nazwa użytkownika i hasło dla bazy danych, czy klucz prywatny django. Po skonfigurowaniu aplikacji należy uruchomić terminal w głównym folderze. W terminalu uruchamiany komendę budującą kontenery:

`docker compose build`

Po zbudowaniu kontenerów uruchamiamy je:

`docker compose up`

Następnie należy uruchomić drugi terminal, również w głównym folderze. W terminalu wpisujemy komendę wykonującą migrację:

`docker-compose exec backend python manage.py migrate`

Po wykonaniu migracji aplikacja będzie dostępna pod adresem

`http://<machine_ip_address>:5173`

## Dokumentacja projektu
Pełna dokumentacja projektu znajduje sie w pliku `raport.pdf` w katalogu głównym repozytorium.