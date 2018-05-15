import { dapp } from './dapp.js';


class Repository {
  constructor(dapp) {
    this.dapp = dapp;
    this.web3 = dapp.web3;
  }

  async getTokensForAddress(goods, escrow, address) {
    const balance = await goods.methods.balanceOf(address).call();
    const items = [];
    for (let i = 0; i < balance; i += 1) {
      const id = await goods.methods.tokenOfOwnerByIndex(address, i).call();
      // check whether good can be spent by looking at approval
      const approved = await escrow.methods.isListed(id).call();
      const price = this.web3.utils.fromWei(
        await escrow.methods.getPrice(id).call(),
      );
      items.push(
        {
          id: id,
          confirmed: true,
          price: price,
          forSale: approved,
        }
      );
    }
    return items;
  }
}

export default new Repository(dapp);
