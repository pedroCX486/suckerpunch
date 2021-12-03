# SuckerPunch

Um automatizador de bater ponto no bugmais. Seja feliz e mande a interface web do pontomais ir pra as coxoxina!

### Como usar:

- Coloque a pasta `suckerpunch` na sua pasta de usuário (Aperte Win+R e digite `%userprofile%`).

- Use o comando `npm install` para preparar seu ambiente.
  
- Coloque seu login e senha do pontomais no `users` JSON a na linha 11.

- Preencha seus horários de batida de ponto no `schedules` JSON na linha 18.
  
- Coloque seu endereço, latitude e longitude (pode pegar do Google Maps) no `location_data` JSON na linha 13.

- Coloque se deve permitir registros em fins de semana ou não no prop `allowWeekends` do users JSON na linha 24.
  
- Utilize `npm start` para inicializar o suckerpunch.

- Caso queria inicialização automática cheque a pasta `autostart` do projeto.

- Caso queira logs de execução salvos em arquivo (mesmo não usando o autostart), inicie o projeto a partir do `autostart/suckerpunch.bat`. Os logs de execução ficam salvos na pasta de `logs` do projeto.

#### Nota 1: Caso não queira a janela do console, foi adicionado o `suckerpunch-svc.exe` na pasta `autostart`. Esse serviço foi criado com o PS2EXE (e pode criar falso positivo em alguns antimalware) e não exibe o console. De brinde, exibe um ícone na bandeja caso queira encerrar o app pra ele não bater mais pontos até ser reaberto.
  
#### Nota 2: Caso queira que o script rode automático todo os dias, use o autostart pra quando você ligar o computador ou utilize algum script externo. Isso também não foi parte do escopo do projeto e por isso não implementamos algo completo. Veja a pasta `autostart` pra mais instruções.
  
#### Nota 3: Eu acho que não preciso dizer que esse projeto não coleta dados. Basta ler o código (e não ser analfabeto de javascript básico) pra ver isso.
  
#### Nota 4: Sim o projeto sem querer querendo suporta multi-usuários.
  

### Requerimentos:

- Node LTS - https://nodejs.org
- PowerShell Core (apenas caso queira usar o script de autostart, e não, não pode ser o PowerShell que vem no Windows) - https://aka.ks/pscore6
  
  
### LICENÇA DE USO:

[WTFPL](http://www.wtfpl.net/)
