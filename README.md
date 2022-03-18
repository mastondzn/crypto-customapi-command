# `crypto-customapi-command`

A custom api that returns a cryptocurrency's price and price change, built with CloudFlare Workers, for use with twitch bots such as Fossabot or StreamElements.

This api currently resides at `https://crypto.synopsis.workers.dev` .

## Example command response for Fossabot

```text
@$(sender), $(customapi https://crypto.synopsis.workers.dev/?coin=$(pathencode $(query))&includeLink=true&includePriceChange=true)
```

![Result](https://i.imgur.com/BSkZG2N.png)

You can change or remove the query parameters if you dont wish to have price changes or links.
