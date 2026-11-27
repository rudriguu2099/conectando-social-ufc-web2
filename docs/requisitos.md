# Documento de Requisitos: Conectando Social UFC

Versão de 23/11/2026.

O MVP tem 22 requisitos funcionais, 19 essenciais e 3 que podem ser cortados se o prazo apertar, distribuídos em 10 telas e 4 tabelas.

## Glossário

Demanda e projeto são o mesmo registro em momentos diferentes do ciclo de vida.

| Termo | Significado |
| --- | --- |
| Demanda | Problema enviado por um parceiro; é um projeto nos status Em análise ou Disponível |
| Projeto | Registro central do sistema: começa como demanda e vai até Concluído ou Cancelado |
| Parceiro | Pessoa da comunidade, com conta, que envia demandas em nome de uma organização |
| Candidatura | Pedido de uma equipe para assumir um projeto disponível |
| Equipe | Alunos que trabalham no projeto, cada um com uma função |
| Professor responsável | Professor que aprovou a equipe e responde pelo projeto |
| Fase | Etapa de um projeto em andamento: Requisitos, Design, Desenvolvimento ou Validação |
| Entrega final | Links do repositório e do Figma registrados; condição para concluir |

## Permissões por perfil

Visitantes só leem, e parceiros enviam e acompanham as próprias demandas; um projeto em andamento só é alterado pela equipe e pelo professor responsável.

| Ação | Visitante | Aluno | Professor | Parceiro |
| --- | --- | --- | --- | --- |
| Ver vitrine e página do projeto | Sim | Sim | Sim | Sim |
| Ver contato do parceiro | Não | Sim | Sim | Só o próprio |
| Ver anexos | Não | Sim | Sim | Só dos próprios projetos |
| Enviar e acompanhar demandas | Não | Não | Não | Sim |
| Candidatar equipe | Não | Sim | Não | Não |
| Aprovar ou rejeitar demanda | Não | Não | Sim | Não |
| Aprovar ou recusar candidatura | Não | Não | Só o professor indicado | Não |
| Mudar fase, link do Figma e anexos | Não | Só membros da equipe | Só o responsável | Não |
| Registrar link do repositório | Não | Não | Só o responsável | Não |
| Concluir ou cancelar projeto em andamento | Não | Não | Só o responsável | Não |
| Cancelar demanda em análise ou disponível | Não | Não | Só disponível | Só a própria |
| Recuperar a própria senha por e-mail | Não | Sim | Sim | Sim |

## Requisitos funcionais

Os 19 requisitos essenciais fecham o fluxo de ponta a ponta; os 3 importantes são os primeiros a cortar se o prazo apertar.

| ID | Área | Requisito | Prioridade |
| --- | --- | --- | --- |
| RF01 | Contas | O visitante cria conta de aluno (nome, e-mail, senha e curso) ou de parceiro (nome, e-mail, senha, organização, tipo de parceiro e telefone) | Essencial |
| RF02 | Contas | Aluno, professor e parceiro entram com e-mail e senha e saem da conta | Essencial |
| RF03 | Contas | Contas de professor são criadas por script (seed); não há autocadastro de professor | Essencial |
| RF04 | Demandas | O parceiro logado envia uma demanda pelo formulário; ela entra Em análise | Essencial |
| RF05 | Demandas | A conta de parceiro só é criada com o aceite do termo de ciência e do consentimento de uso dos dados; a data do aceite fica registrada | Essencial |
| RF06 | Demandas | O professor aprova as demandas Em análise (vão para Disponível) ou as rejeita, com motivo opcional | Essencial |
| RF07 | Demandas | O parceiro vê as próprias demandas, o status de cada uma e o motivo quando rejeitada ou cancelada | Essencial |
| RF08 | Vitrine | A página inicial lista os projetos em abas: Disponíveis (inclui Aguardando aprovação), Em andamento e Concluídos; cada card mostra título, organização, status ou fase e a data da última atualização | Essencial |
| RF09 | Vitrine | A página do projeto mostra problema, quem é afetado, resultado esperado, organização, tipo de parceiro, status, fase, professor responsável, disciplina, semestre, equipe com funções, links e última atualização | Essencial |
| RF10 | Vitrine | O contato do parceiro aparece só para alunos, professores e o próprio parceiro; os anexos, só para alunos, professores e o parceiro do projeto | Essencial |
| RF11 | Equipe | O aluno logado se candidata a um projeto Disponível informando membros (por e-mail), função de cada um, professor responsável, disciplina e semestre; o projeto vai para Aguardando aprovação | Essencial |
| RF12 | Equipe | O professor indicado aprova a candidatura (projeto vai para Em andamento, fase Requisitos) ou a recusa (equipe removida, projeto volta a Disponível) | Essencial |
| RF13 | Equipe | Membros e professor responsável adicionam ou removem membros e mudam funções durante o andamento | Importante |
| RF14 | Acompanhamento | Membros e professor responsável mudam a fase: Requisitos, Design, Desenvolvimento ou Validação | Essencial |
| RF15 | Acompanhamento | O professor responsável registra e altera o link do repositório no GitHub | Essencial |
| RF16 | Acompanhamento | Membros e professor responsável registram e alteram o link do protótipo no Figma | Essencial |
| RF17 | Acompanhamento | Membros e professor responsável enviam anexos com categoria (Requisitos, Design, Código, Relatório ou Outro); alunos, professores e o parceiro do projeto baixam; quem enviou ou o professor responsável remove | Essencial |
| RF18 | Conclusão | O professor responsável conclui o projeto, desde que os links do repositório e do Figma estejam registrados | Essencial |
| RF19 | Conclusão | O professor responsável cancela um projeto em andamento; o parceiro cancela a própria demanda Em análise ou Disponível; qualquer professor cancela uma demanda Disponível; motivo opcional | Importante |
| RF20 | Painéis | Tela de pendências do professor com as demandas Em análise e as candidaturas em que foi indicado | Essencial |
| RF21 | Painéis | Aluno e professor veem a lista dos projetos de que participam | Importante |
| RF22 | Contas | Aluno, professor e parceiro recuperam a senha por e-mail: pedem um link em Recuperar senha, recebem o e-mail e criam uma senha nova | Essencial |

## Regras de negócio

Cada projeto tem um status por vez, e só as transições da tabela são permitidas; o diagrama do documento de visão mostra o mesmo fluxo.

| De | Para | Quem | Condição |
| --- | --- | --- | --- |
| Novo | Em análise | Parceiro | Demanda enviada pelo parceiro logado |
| Em análise | Disponível | Qualquer professor | Demanda atende ao critério da disciplina |
| Em análise | Rejeitado | Qualquer professor | Motivo opcional |
| Em análise | Cancelado | Parceiro dono | Desistiu da demanda |
| Disponível | Aguardando aprovação | Aluno | Candidatura completa (RF11) |
| Disponível | Cancelado | Parceiro dono ou qualquer professor | Demanda perdeu a validade |
| Aguardando aprovação | Em andamento | Professor indicado | A fase começa em Requisitos |
| Aguardando aprovação | Disponível | Professor indicado | Candidatura recusada; equipe removida |
| Em andamento | Concluído | Professor responsável | Links do repositório e do Figma registrados |
| Em andamento | Cancelado | Professor responsável | Motivo opcional |

| ID | Regra |
| --- | --- |
| RN01 | A fase só existe com o projeto Em andamento; começa em Requisitos e pode avançar ou voltar |
| RN02 | Um projeto tem no máximo uma candidatura pendente ou uma equipe por vez |
| RN03 | Quem envia a candidatura faz parte da equipe, e todos os membros precisam ter conta de aluno |
| RN04 | Só o professor indicado avalia a candidatura e, ao aprová-la, torna-se o professor responsável |
| RN05 | O critério para aceitar uma demanda é o da disciplina, e qualquer professor pode avaliar demandas Em análise; demandas de setores da UFC são aceitas |
| RN06 | O repositório fica no perfil do professor responsável, que registra o link; no MVP aceita-se o perfil de um aluno |
| RN07 | Só membros da equipe e o professor responsável alteram um projeto Em andamento |
| RN08 | Projetos Concluídos, Cancelados e Rejeitados ficam somente para leitura |
| RN09 | Visitantes nunca veem contato de parceiro nem anexos, e um parceiro não vê o contato de outros parceiros |
| RN10 | Um aluno pode estar em mais de um projeto ao mesmo tempo |
| RN11 | Toda alteração no projeto, inclusive em anexos, atualiza a data da última atualização |
| RN12 | Toda demanda pertence a um parceiro com conta; organização e contato vêm do cadastro do parceiro |
| RN13 | A demanda não é editada depois de enviada; se for rejeitada, o parceiro envia uma nova |
| RN14 | O link de recuperação de senha vale por 1 hora e só funciona uma vez; pedir outro invalida o anterior, e um novo pedido só é aceito 1 minuto depois do último |
| RN15 | O pedido de recuperação recebe a mesma resposta exista ou não uma conta com o e-mail, para não revelar quem está cadastrado |
| RN16 | Toda senha, no cadastro ou na recuperação, tem pelo menos 8 caracteres |

## Cadastro do parceiro e formulário de demanda

O cadastro guarda a organização e o contato uma vez, e a demanda só pergunta pelo problema: 6 campos em cada um, mais o aceite do termo.

### Cadastro do parceiro

| Campo | Tipo | Obrigatório |
| --- | --- | --- |
| Nome do responsável | Texto curto | Sim |
| E-mail | E-mail | Sim |
| Senha | Senha | Sim |
| Organização | Texto curto | Sim |
| Tipo de parceiro | Lista: ONG, associação ou coletivo; pequeno negócio ou MEI; escola; outra instituição de ensino; órgão público; setor da UFC; outro | Sim |
| Telefone ou WhatsApp | Texto curto | Não |

Texto do termo, numa única caixa de confirmação no cadastro:

> Entendo que os projetos são feitos por estudantes, dentro de disciplinas da UFC e sem custo; que o prazo segue o semestre letivo e o resultado pode ser um protótipo; e que não há garantia de conclusão, manutenção ou hospedagem. Autorizo o uso dos meus dados de contato para que professores e alunos da UFC falem comigo sobre as demandas que eu enviar.

### Formulário de demanda

No topo aparece a ajuda: “Descreva o problema, não a solução: a equipe vai propor a solução junto com vocês.”

| Campo | Tipo | Obrigatório |
| --- | --- | --- |
| Título da demanda | Texto curto | Sim |
| Qual é o problema? | Texto longo | Sim |
| Quem é afetado por ele? | Texto longo | Sim |
| Como vocês lidam com isso hoje? | Texto longo | Não |
| O que seria um bom resultado? | Texto longo | Sim |
| Disponibilidade para reuniões | Texto curto | Não |

Depois do envio, a demanda aparece em Minhas demandas com o status Em análise.

## Requisitos não funcionais

Mobile first vale para todas as telas, inclusive as do professor, e não só para as públicas.

| ID | Requisito |
| --- | --- |
| RNF01 | Mobile first: cada tela é desenhada primeiro para celular (360 px de largura) e depois adaptada para tablet e desktop |
| RNF02 | No celular: uma coluna, cards em vez de tabelas, ações principais ao alcance do polegar e áreas de toque de pelo menos 48 px |
| RNF03 | Interface em português com componentes do MUI, o mesmo kit usado no protótipo do Figma |
| RNF04 | Front-end em React + Vite; API REST em Node + Express; Prisma + PostgreSQL; tudo sobe com Docker Compose |
| RNF05 | Senhas guardadas com hash (bcrypt ou argon2) e tokens de recuperação de senha também só com hash; nada em texto puro |
| RNF06 | Toda permissão é verificada na API, e não só escondida na interface |
| RNF07 | Anexos de até 20 MB nos formatos PDF, PNG, JPG, DOCX, XLSX e ZIP, guardados num volume do Docker |
| RNF08 | Links só com http(s); o repositório precisa estar em github.com e o protótipo em figma.com |
| RNF09 | LGPD: contato do parceiro fora das páginas públicas e data do consentimento registrada |
| RNF10 | Acessibilidade básica: campos com rótulo, contraste adequado e formulários navegáveis por teclado |
| RNF11 | O sistema sobe com `docker compose up`, e um seed cria contas de professor e projetos de exemplo |
| RNF12 | O e-mail de recuperação sai por SMTP, com servidor e credenciais em variáveis de ambiente, para trocar de provedor sem mudar o código; em desenvolvimento, o Docker Compose inclui um Mailpit que mostra os e-mails enviados |

## Telas

São 10 telas. O que cada perfil faz num projeto fica dentro da página do projeto, em vez de telas separadas.

| Tela | Perfil | O que tem | Requisitos |
| --- | --- | --- | --- |
| T01 Vitrine (início) | Todos | Abas Disponíveis, Em andamento e Concluídos, com cards | RF08 |
| T02 Página do projeto | Todos | Detalhes, equipe, links e anexos; ações por perfil: candidatar, mudar fase, links, anexos, equipe, concluir e cancelar | RF09, RF10, RF13 a RF19 |
| T03 Enviar demanda | Parceiro | Formulário e confirmação | RF04 |
| T04 Entrar | Todos com conta | E-mail, senha e o link Esqueci minha senha | RF02, RF22 |
| T05 Criar conta | Visitante | Cadastro de aluno ou de parceiro, com o termo para parceiro | RF01, RF05 |
| T06 Candidatura | Aluno | Membros, funções, professor, disciplina e semestre | RF11 |
| T07 Pendências | Professor | Demandas em análise e candidaturas, com aprovar e recusar | RF06, RF12, RF20 |
| T08 Meus projetos | Aluno, professor e parceiro | Projetos de que a pessoa participa; para o parceiro, as próprias demandas com status | RF07, RF21 |
| T09 Recuperar senha | Todos com conta | Pedido do link por e-mail e confirmação de envio | RF22 |
| T10 Nova senha | Todos com conta | Senha nova a partir do link do e-mail; aviso quando o link venceu ou já foi usado | RF22 |

Navegação: é só site responsivo, sem aplicativo. No celular, o cabeçalho tem a marca e um botão de menu com Vitrine, Meus projetos (Minhas demandas, para parceiro), Pendências para professor e Sair. No desktop, esses links ficam visíveis no cabeçalho. Cada página tem título e link de volta (← Vitrine); o parceiro envia demandas por um botão em Minhas demandas.

## Rotas de apoio

A tela T06 Candidatura usa duas rotas que não mudam nenhum registro; a lista completa da API está no Swagger, em `/api/docs`.

| Rota | Quem usa | O que devolve |
| --- | --- | --- |
| `GET /api/users/professors` | Aluno, professor e parceiro logados | Id e nome dos professores, para escolher o professor responsável |
| `GET /api/users/students?email=` | Aluno | Id, nome e e-mail do colega com aquele e-mail exato; erro se não houver conta de aluno |

## Modelo de dados

Quatro tabelas bastam, porque demanda e projeto são o mesmo registro. Os nomes seguem o padrão em inglês do schema que já está no repositório.

### User

| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | Chave |
| name | String | Nome |
| email | String | Único |
| passwordHash | String | Hash da senha |
| passwordResetTokenHash | String? | Hash do token do link de recuperação; apagado quando a senha muda |
| passwordResetExpiresAt | DateTime? | Validade do link: 1 hora depois do pedido |
| role | Role | Aluno, professor ou parceiro |
| course | String? | Só aluno: curso |
| organization | String? | Só parceiro: organização |
| partnerType | PartnerType? | Só parceiro: tipo de parceiro |
| phone | String? | Só parceiro: telefone ou WhatsApp |
| termsAcceptedAt | DateTime? | Só parceiro: data do aceite do termo |
| createdAt | DateTime | Data de criação |

### Project

| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | Chave |
| title | String | Título da demanda |
| problem | String | Qual é o problema |
| affected | String | Quem é afetado |
| currentSituation | String? | Como lidam hoje |
| expectedOutcome | String | O que seria um bom resultado |
| availability | String? | Disponibilidade para reuniões |
| partnerId | UUID → User | Parceiro dono da demanda |
| status | ProjectStatus | Status atual |
| phase | Phase? | Só com o projeto em andamento |
| professorId | UUID? → User | Professor indicado e, depois da aprovação, responsável |
| applicantId | UUID? → User | Aluno que enviou a candidatura; apagado se ela for recusada |
| appliedAt | DateTime? | Data de envio da candidatura; apagada se ela for recusada |
| discipline | String? | Ex.: Projeto Integrado I |
| semester | String? | Ex.: 2026.2 |
| repoUrl | String? | Registrado pelo professor |
| figmaUrl | String? | Link do protótipo |
| statusReason | String? | Motivo de rejeição ou cancelamento |
| createdAt, updatedAt | DateTime | updatedAt alimenta “atualizado há X dias” |

### ProjectMember

| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | Chave |
| projectId | UUID → Project | Projeto |
| userId | UUID → User | Aluno; único por projeto |
| teamRole | String | Função: PO, Scrum Master, UX/UI, Front-end, Back-end, QA ou outra |

### Attachment

| Campo | Tipo | Observação |
| --- | --- | --- |
| id | UUID | Chave |
| projectId | UUID → Project | Projeto |
| uploadedById | UUID → User | Quem enviou |
| fileName | String | Nome original |
| storagePath | String | Caminho no volume do Docker |
| mimeType | String | Tipo do arquivo |
| size | Int | Tamanho em bytes |
| category | AttachmentCategory | Categoria |
| createdAt | DateTime | Data do envio |

### Enums

| Enum | Valores |
| --- | --- |
| Role | STUDENT, PROFESSOR, PARTNER |
| ProjectStatus | IN_REVIEW, REJECTED, AVAILABLE, AWAITING_APPROVAL, IN_PROGRESS, COMPLETED, CANCELED |
| Phase | REQUIREMENTS, DESIGN, DEVELOPMENT, VALIDATION |
| PartnerType | NGO, SMALL_BUSINESS, SCHOOL, EDUCATION_INSTITUTION, PUBLIC_AGENCY, UFC_SECTOR, OTHER |
| AttachmentCategory | REQUIREMENTS, DESIGN, CODE, REPORT, OTHER |

## Roteiro de demonstração e ordem de corte

O MVP está pronto quando este roteiro roda inteiro, no celular, sem erro.

1. Um parceiro cria a conta de uma associação e envia uma demanda.
2. Um professor aprova a demanda em Pendências, e ela aparece em Disponíveis.
3. Um aluno cadastrado se candidata com três colegas, informando funções, professor, disciplina e semestre.
4. O professor indicado aprova; o projeto vai para Em andamento, na fase Requisitos.
5. A equipe anexa o documento de requisitos, avança para Design e registra o link do Figma.
6. O professor registra o link do repositório.
7. A equipe avança até Validação, e o professor conclui o projeto.
8. O projeto aparece em Concluídos com equipe, links e anexos, e o parceiro o vê em Minhas demandas.

Também precisam falhar: concluir sem os dois links, um visitante ver contato ou anexos, um parceiro ver o contato de outro parceiro, um aluno de fora da equipe editar o projeto e alguém usar um link de recuperação de senha vencido ou já usado.

Se o prazo apertar, corte nesta ordem: RF21 (Meus projetos de aluno e professor), RF13 (editar equipe) e RF19 (cancelar).
