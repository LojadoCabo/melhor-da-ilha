/**
 * Google Workspace Integration Service
 * Client-side integration for Google Sheets, Google Calendar, and Google Docs
 * Using OAuth 2.0 Access Token in-memory.
 */

import { Business } from '../types';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  htmlLink: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

export interface CreatedWorkspaceResource {
  type: 'sheets' | 'calendar' | 'docs';
  id: string;
  title: string;
  url: string;
  createdAt: string;
  details?: string;
}

// ----------------------------------------------------------------------
// Google Sheets API
// ----------------------------------------------------------------------

export async function exportBusinessesToGoogleSheets(
  accessToken: string,
  businesses: Business[],
  sheetTitle = 'Melhor da Ilha - Catálogo de Estabelecimentos'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; rowCount: number }> {
  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: `${sheetTitle} (${new Date().toLocaleDateString('pt-BR')})`
      },
      sheets: [
        {
          properties: {
            title: 'Estabelecimentos',
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao criar planilha no Google Sheets.');
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare headers and rows
  const headers = [
    'ID',
    'Nome do Estabelecimento',
    'Categoria',
    'Cidade',
    'Bairro / Região',
    'Endereço Completo',
    'Telefone',
    'WhatsApp',
    'Instagram',
    'Website',
    'Status Digital / Web',
    'Avaliação (Google)',
    'Nº Avaliações',
    'Faixa de Preço',
    'Destaque Ilha/RMS',
    'Descrição'
  ];

  const rows = businesses.map(b => [
    b.id,
    b.name,
    b.categoryName || b.categoryId,
    b.cityName,
    b.neighborhood,
    b.address,
    b.phone || '',
    b.whatsapp || '',
    b.instagram || '',
    b.website || '',
    b.websiteStatusText || (b.website ? 'Site Ativo' : 'Atendimento WhatsApp'),
    b.rating,
    b.reviewCount,
    b.priceLevel,
    b.isRmsPremium ? 'CLIENTE PREMIUM' : b.isFeatured ? 'DESTAQUE' : 'COMUM',
    b.description || ''
  ]);

  const values = [headers, ...rows];

  // 3. Write data to sheet
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Estabelecimentos!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values
      })
    }
  );

  if (!appendRes.ok) {
    const errorData = await appendRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao popular os dados na planilha.');
  }

  // 4. Style Header row (Teal #0f766e background, bold white text)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.06, green: 0.46, blue: 0.43 },
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 11
                  },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 16
              }
            }
          }
        ]
      })
    });
  } catch (styleErr) {
    console.warn('Could not apply advanced styling to sheet, basic sheet created successfully:', styleErr);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    rowCount: businesses.length
  };
}

export async function createCrmGoogleSheet(
  accessToken: string,
  title = 'Melhor da Ilha - Gestão Comercial e CRM de Parceiros'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: `${title} (${new Date().toLocaleDateString('pt-BR')})`
      },
      sheets: [
        {
          properties: {
            title: 'Prospecção & Parceiros',
            gridProperties: { frozenRowCount: 1 }
          }
        },
        {
          properties: {
            title: 'Reuniões & Visitas',
            gridProperties: { frozenRowCount: 1 }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao criar planilha CRM no Google Sheets.');
  }

  const data = await createRes.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Headers for Sheet 1
  const partnersHeaders = [
    'Empresa / Estabelecimento',
    'Região / Bairro',
    'Responsável / Contato',
    'WhatsApp / Telefone',
    'Status (Lead / Negociação / Fechado / Cliente)',
    'Plano / Pacote de Anúncio',
    'Valor Proposto (R$)',
    'Data Primeiro Contato',
    'Observações'
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Prospecção & Parceiros'!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [partnersHeaders]
      })
    }
  );

  return { spreadsheetId, spreadsheetUrl };
}

// ----------------------------------------------------------------------
// Google Calendar API
// ----------------------------------------------------------------------

export interface CalendarEventPayload {
  summary: string;
  description: string;
  location?: string;
  startDateTime: string; // ISO String (e.g. 2026-10-30T10:00:00-03:00)
  endDateTime: string;   // ISO String
}

export async function createGoogleCalendarEvent(
  accessToken: string,
  event: CalendarEventPayload
): Promise<{ id: string; htmlLink: string; summary: string }> {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bahia';

  const body = {
    summary: event.summary,
    description: event.description,
    location: event.location || 'Salvador / Ilha de Itaparica - BA',
    start: {
      dateTime: event.startDateTime,
      timeZone
    },
    end: {
      dateTime: event.endDateTime,
      timeZone
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'popup', minutes: 120 },
        { method: 'email', minutes: 1440 }
      ]
    }
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao agendar evento no Google Calendar.');
  }

  const data = await res.json();
  return {
    id: data.id,
    htmlLink: data.htmlLink,
    summary: data.summary || event.summary
  };
}

export async function listUpcomingGoogleCalendarEvents(
  accessToken: string,
  maxResults = 10
): Promise<CalendarEvent[]> {
  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    now
  )}&singleEvents=true&orderBy=startTime&maxResults=${maxResults}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao carregar eventos da agenda.');
  }

  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summary || 'Sem título',
    description: item.description,
    location: item.location,
    htmlLink: item.htmlLink,
    start: item.start || {},
    end: item.end || {}
  }));
}

export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok && res.status !== 204) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao remover evento do Google Calendar.');
  }
}

// ----------------------------------------------------------------------
// Google Docs API
// ----------------------------------------------------------------------

export async function createBusinessGoogleDoc(
  accessToken: string,
  business: Business
): Promise<{ documentId: string; documentUrl: string; title: string }> {
  const title = `Dossiê Comercial - ${business.name}`;

  // 1. Create document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao criar documento no Google Docs.');
  }

  const data = await createRes.json();
  const documentId = data.documentId;
  const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

  // 2. Prepare structured text
  const dateFormatted = new Date().toLocaleDateString('pt-BR');
  const content = [
    `DOSSIÊ COMERCIAL & PERFIL DE ESTABELECIMENTO\n`,
    `MELHOR DA ILHA - GUIA ILHA DE ITAPARICA & REGIÃO METROPOLITANA DE SALVADOR\n`,
    `Data de Emissão: ${dateFormatted}\n\n`,
    `1. DADOS PRINCIPAIS DO ESTABELECIMENTO\n`,
    `• Nome: ${business.name}\n`,
    `• Categoria: ${business.categoryName || business.categoryId}\n`,
    `• Cidade: ${business.cityName} | Bairro / Região: ${business.neighborhood}\n`,
    `• Endereço: ${business.address}\n`,
    `• Telefone: ${business.phone || 'Não informado'}\n`,
    `• WhatsApp: ${business.whatsapp || 'Não informado'}\n`,
    `• Instagram: ${business.instagram ? `@${business.instagram}` : 'Não informado'}\n`,
    `• Website: ${business.website || 'Sem site cadastrado'}\n`,
    `• Status Web: ${business.websiteStatusText || (business.website ? 'Site Ativo' : 'Atendimento WhatsApp')}\n\n`,
    `2. AVALIAÇÃO E POSICIONAMENTO\n`,
    `• Nota Google: ⭐ ${business.rating.toFixed(1)} / 5.0 (${business.reviewCount} avaliações)\n`,
    `• Faixa de Preço: ${business.priceLevel}\n`,
    `• Status no Guia: ${business.isRmsPremium ? 'CLIENTE PREMIUM COM DESTAQUE MÁXIMO' : business.isFeatured ? 'DESTAQUE EM EVIDÊNCIA' : 'CADASTRO REGULAR'}\n\n`,
    `3. APRESENTAÇÃO E SERVIÇOS\n`,
    `${business.description || 'Estabelecimento atuante na região com atendimento de excelência.'}\n\n`,
    `4. RECOMENDAÇÕES DE CRESCIMENTO E PRESENÇA DIGITAL\n`,
    `• Divulgação contínua no Guia Melhor da Ilha para alcançar turistas e moradores locais.\n`,
    `• Otimização de palavras-chave para Salvador, Brotas e Ilha de Itaparica.\n`,
    `• Acompanhamento de avaliações e integração direta com WhatsApp para conversão rápida de clientes.\n\n`,
    `Link direto do perfil na plataforma: https://melhordailha.com.br/?business=${business.slug || business.id}\n`
  ].join('');

  // 3. Insert content into the document
  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: content
          }
        }
      ]
    })
  });

  if (!updateRes.ok) {
    const errorData = await updateRes.json().catch(() => ({}));
    console.warn('Could not insert detailed text into Doc, blank doc ready:', errorData);
  }

  return {
    documentId,
    documentUrl,
    title
  };
}

export async function createRegionGuideGoogleDoc(
  accessToken: string,
  regionName: string,
  businesses: Business[]
): Promise<{ documentId: string; documentUrl: string; title: string }> {
  const title = `Guia Comercial & Roteiro - ${regionName}`;

  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao criar documento do Guia Regional.');
  }

  const data = await createRes.json();
  const documentId = data.documentId;
  const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

  const topBusinesses = businesses.slice(0, 30);
  const itemsText = topBusinesses
    .map((b, idx) => {
      return `${idx + 1}. ${b.name} (${b.categoryName || b.categoryId})\n   Endereço: ${b.address} - ${b.neighborhood}, ${b.cityName}\n   Contato: ${b.whatsapp || b.phone || 'Ver no Guia'}\n   Avaliação: ⭐ ${b.rating.toFixed(1)} (${b.reviewCount} avaliações)\n   Link: https://melhordailha.com.br/?business=${b.slug || b.id}\n`;
    })
    .join('\n');

  const content = [
    `GUIA COMERCIAL, TURÍSTICO E GASTRONÔMICO: ${regionName.toUpperCase()}\n`,
    `MELHOR DA ILHA - GUIA ILHA DE ITAPARICA & RMS\n`,
    `Data: ${new Date().toLocaleDateString('pt-BR')} | Total Selecionado: ${businesses.length} estabelecimentos\n\n`,
    `SELEÇÃO DOS PRINCIPAIS ESTABELECIDOS EM DESTAQUE:\n\n`,
    itemsText,
    `\n\nConsulte o catálogo completo com todos os mais de 2.100 estabelecimentos em nosso portal oficial: https://melhordailha.com.br\n`
  ].join('');

  await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: content
          }
        }
      ]
    })
  });

  return {
    documentId,
    documentUrl,
    title
  };
}

export async function createCommercialContractGoogleDoc(
  accessToken: string,
  business: Business,
  planName = 'Plano Parceiro Premium Ilha & Salvador',
  valueFormatted = 'R$ 89,90 / mês'
): Promise<{ documentId: string; documentUrl: string; title: string }> {
  const title = `Proposta & Contrato de Divulgação - ${business.name}`;

  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao criar minuta de contrato.');
  }

  const data = await createRes.json();
  const documentId = data.documentId;
  const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

  const content = [
    `PROPOSTA COMERCIAL E CONTRATO DE DIVULGAÇÃO DIGITAL\n`,
    `PLATAFORMA: MELHOR DA ILHA (ILHA DE ITAPARICA, SALVADOR & RMS)\n\n`,
    `CONTRATANTE:\n`,
    `• Razão Social / Nome Fantasia: ${business.name}\n`,
    `• Bairro / Cidade: ${business.neighborhood}, ${business.cityName} - BA\n`,
    `• Telefone / WhatsApp: ${business.whatsapp || business.phone || ''}\n\n`,
    `CONTRATADA:\n`,
    `• Portal Melhor da Ilha - Guia Comercial & Turístico\n\n`,
    `CLÁUSULA 1ª - DO OBJETO:\n`,
    `Inclusão prioritária do CONTRATANTE no guia interativo Melhor da Ilha, com mini-site exclusivo, botão direto para WhatsApp, galeria de fotos, mapa geolocalizado e destaque na categoria ${business.categoryName || business.categoryId}.\n\n`,
    `CLÁUSULA 2ª - DO INVESTIMENTO:\n`,
    `Pelo serviço prestado, fica acordado o plano "${planName}" no valor de ${valueFormatted}.\n\n`,
    `CLÁUSULA 3ª - DA VIGÊNCIA:\n`,
    `Vigência de 12 (doze) meses a partir da data de assinatura.\n\n`,
    `Salvador/BA, ${new Date().toLocaleDateString('pt-BR')}.\n\n\n`,
    `_________________________________________\n`,
    `${business.name} (Contratante)\n\n`,
    `_________________________________________\n`,
    `Melhor da Ilha (Contratada)\n`
  ].join('');

  await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: content
          }
        }
      ]
    })
  });

  return {
    documentId,
    documentUrl,
    title
  };
}
