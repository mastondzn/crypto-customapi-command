import type { Coin } from './types';

const baseUrl = 'https://api.coingecko.com/';
const path = 'api/v3/coins/markets';
const urlParams =
  '?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=1h,24h,7d';

const url = `${baseUrl}${path}${urlParams}`;
const upArrow = '↗';
const downArrow = '↘';

const constructMessage = (coin: Coin) => {
  return `Current price of ${coin.name} is: ${coin.current_price.toLocaleString(
    void 0,
    { style: 'currency', currency: 'USD' },
  )}.`;
};

const constructChange = (coin: Coin) => {
  const hour = coin.price_change_percentage_1h_in_currency;
  const day = coin.price_change_percentage_24h_in_currency;
  const week = coin.price_change_percentage_7d_in_currency;
  const hourArrow = hour < 0 ? downArrow : upArrow;
  const dayArrow = day < 0 ? downArrow : upArrow;
  const weekArrow = week < 0 ? downArrow : upArrow;
  const hourString = `${hourArrow}${hour.toLocaleString().replace('-', '')}`;
  const dayString = `${dayArrow}${day.toLocaleString().replace('-', '')}`;
  const weekString = `${weekArrow}${week.toLocaleString().replace('-', '')}`;

  return `1h:${hourString} / 1d:${dayString} / 1w:${weekString}`;
};

const constructUpdate = (coin: Coin) => {
  const now = Date.now();
  const updatedAt = new Date(coin.last_updated).getTime();
  if (Number.isNaN(updatedAt)) {
    return 'Could not parse update time.';
  }
  const diff = (now - updatedAt) / 1000;

  return `updated ${diff.toLocaleString()}s ago`;
};

const constructLink = (coin: Coin) =>
  `https://coingecko.com/en/coins/${coin.id}`;

export async function handleRequest(event: FetchEvent): Promise<Response> {
  const { searchParams: params } = new URL(event.request.url);
  const includePriceChange = params.get('includePriceChange') === 'true';
  const includeLink = params.get('includeLink') === 'true';
  const wantedCoin = params.get('coin')?.toLowerCase();

  if (!wantedCoin || wantedCoin?.length < 1) {
    return new Response(`No coin/ticker found in parameters.`, {
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  const response = await (await fetch(url)).json();

  if ((response as { error: string })?.error) {
    return new Response(
      `CoinGecko API reported an error (${
        (response as { error: string }).error
      }).`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      },
    );
  }

  if (typeof (response as Coin[])?.[0]?.symbol !== 'string') {
    return new Response(`Malformed API response.`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  const coins = response as Coin[];
  const coinFound = coins.find((e) => {
    return (
      e.name.toLowerCase() === wantedCoin.toLowerCase() ||
      e.symbol.toLowerCase() === wantedCoin.toLowerCase() ||
      e.id.toLowerCase() === wantedCoin.toLowerCase().replace(/\s/g, '-')
    );
  });

  if (!coinFound) {
    return new Response(`Coin/ticker was not found in top 250.`, {
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  let textResponse: string = '';
  textResponse = textResponse + constructMessage(coinFound);
  if (includePriceChange) {
    textResponse = textResponse + ` ${constructChange(coinFound)}.`;
  }
  if (includeLink) {
    textResponse = textResponse + ` ${constructLink(coinFound)}`;
  }
  textResponse = textResponse + ` (${constructUpdate(coinFound)})`;

  console.log(textResponse);

  return new Response(textResponse, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
