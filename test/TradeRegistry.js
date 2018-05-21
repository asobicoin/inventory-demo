const assertRejected = require("assert-rejected");

const TradeRegistry = artifacts.require("contracts/TradeRegistry.sol");
const Trade = artifacts.require("contracts/Trade.sol");

contract("TradeRegistry", accounts => {
  const traderA = accounts[1];
  const traderB = accounts[2];
  const traderC = accounts[3];
  const traderAOptions = {from: traderA};
  const traderBOptions = {from: traderB};
  const traderCOptions = {from: traderC};

  let trade;
  let registry;

  beforeEach(async () => {
    registry = await TradeRegistry.new();
    trade = await Trade.new("0x0", [traderA, traderB]);
  });

  it("has no trades in the beginning", async () => {
    assert.equal(await registry.numTrades(), 0);
  });

  it("will only let participating traders add a trade", async () => {
    await assertRejected(registry.add(trade.address, traderCOptions));
  });

  it("won't accept finalized trades", async () => {
    await trade.accept(traderAOptions);
    await trade.accept(traderBOptions);
    await assertRejected(registry.add(trade.address, traderAOptions));
  });

  describe("one trade added", () => {
    beforeEach(async () => {
      await registry.add(trade.address, traderAOptions);
    });

    it("can get the trade for trader a", async () => {
      assert.equal(await registry.traderTrade(traderA), trade.address);
    });

    it("counts one trade", async () => {
      assert.equal(await registry.numTrades(), 1);
    });

    it("can only have one trade per trader", async () => {
      const otherTrade = await Trade.new("0x0", [traderA, traderC]);
      await assertRejected(registry.add(trade.address, traderAOptions));
      await assertRejected(registry.add(trade.address, traderCOptions));
    });

    it("allows retrieving trades", async () => {
      assert.equal(trade.address, await registry.trades(0));
    });

    describe("with the finalized trade removed", () => {
      beforeEach(async () => {
        await trade.accept(traderAOptions);
        await trade.accept(traderBOptions);
        await registry.remove(traderAOptions);
      });

      it("counts zero trades", async () => {
        assert.equal(await registry.numTrades(), 0);
        await assertRejected(registry.trades(0));
      });

      it("won't accept the same trade again", async () => {
        await assertRejected(registry.add(trade.address, traderAOptions));
      });

      it("can add another trade for the same users", async () => {
        const otherTrade = await Trade.new("0x0", [traderA, traderB]);
        await registry.add(otherTrade.address, traderAOptions);
      });
    });

    it("can't remove ongoing trades", async () => {
      await assertRejected(registry.remove(traderAOptions));
    });
  });
});
