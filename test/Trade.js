const assertRejected = require("assert-rejected");
// const testHelper = require("truffle-test-helpers");
// const utils = require("web3-utils");

const Goods = artifacts.require("contracts/Goods.sol");
const Trade = artifacts.require("contracts/Trade.sol");

contract("Trade", accounts => {
  const traderA = accounts[1];
  const traderB = accounts[2];
  const thirdPerson = accounts[3];
  const traderAOptions = { from: traderA };
  const traderBOptions = { from: traderB };
  const thirdPersonOptions = { from: thirdPerson };

  const good1 = 0;
  const good2 = 1;
  const good3 = 2;
  const good4 = 3;
  const good5 = 4;

  let goods;
  let trade;

  beforeEach(async () => {
    goods = await Goods.new();
    trade = await Trade.new(goods.address, [traderA, traderB]);
  });

  it("can be created", async () => {
    assert.equal(await trade.traders(0), traderA);
  });

  it("has no goods pulled", async () => {
    assert.isFalse(await trade.traderPulledGoods(traderA));
    assert.isFalse(await trade.traderPulledGoods(traderB));
  });

  it("knows which address is a trader", async () => {
    assert.isTrue(await trade.isTrader(traderA));
    assert.isFalse(await trade.isTrader(thirdPerson));
  });

  describe("cancelling", () => {
    beforeEach(async () => {
      await trade.cancel(traderAOptions);
    });

    it("the trade is cancelled", async () => {
      assert.isFalse(await trade.isActive());
    });

    it("won't let someone cancel again", async () => {
      await assertRejected(trade.cancel(traderBOptions));
    });

    it("won't let someone accept", async () => {
      await assertRejected(trade.accept(traderAOptions));
    });
  });

  describe("final state", () => {
    it("is false in the beginning", async () => {
      assert.isFalse(await trade.isFinal());
    });

    describe("when trader A accepts", async () => {
      beforeEach(async () => {
        await trade.accept(traderAOptions);
      });

      it("is false if only one trader accepts", async () => {
        assert.isFalse(await trade.isFinal());
        assert.equal(await trade.numTradersAccepted(), 1);
      });

      it("won't let trader A cancel", async () => {
        await assertRejected(trade.cancel(traderAOptions));
      });

      describe("and trader B accepts", () => {
        beforeEach(async () => {
          await trade.accept(traderBOptions);
        });

        it("is finalized", async () => {
          assert.isTrue(await trade.isFinal());
        });
      });
    });
  });

  describe("goods", () => {
    beforeEach(async () => {
      await goods.mint(traderA);
      await goods.mint(traderB);
      await goods.mint(traderB);
      await goods.mint(traderA);
      await goods.mint(thirdPerson);
    });

    it("won't let trader A add after accepting", async () => {
      await trade.accept(traderAOptions);
      await assertRejected(
        goods.safeTransferFrom(
          traderA,
          trade.address,
          good1,
          traderAOptions,
        ),
      );
    });

    it("cannot be added by a third person", async () => {
      await assertRejected(goods.safeTransferFrom(
        thirdPerson,
        trade.address,
        good5,
        thirdPersonOptions,
      ));
    });

    describe("with trader A good transfer", () => {
      beforeEach(async () => {
        await goods.safeTransferFrom(
          traderA,
          trade.address,
          good1,
          traderAOptions,
        );
      });

      it("is belong to the trade contract", async () => {
        assert.equal(await goods.ownerOf(good1), trade.address);
      });

      it("lets trader A remove goods", async () => {
        assert.equal((await goods.ownerOf(good1)), trade.address);
        await trade.removeGood(good1, traderAOptions);
        assert.equal((await goods.ownerOf(good1)), traderA);
      });

      it("won't let trader A remove after accepting", async () => {
        await trade.accept(traderAOptions);
        await assertRejected(trade.removeGood(good1, traderAOptions));
      });

      it("won't let a anyone else remove goods", async () => {
        assert.equal((await goods.ownerOf(good1)), trade.address);
        await assertRejected(trade.removeGood(good1, traderBOptions));
        await assertRejected(trade.removeGood(good1, thirdPersonOptions));
        assert.equal((await goods.ownerOf(good1)), trade.address);
      });
    });

    describe("fully added", () => {
      beforeEach(async () => {
        await goods.safeTransferFrom(
          traderA, trade.address, good1, traderAOptions,
        );
        await goods.safeTransferFrom(
          traderB, trade.address, good2, traderBOptions,
        );
        await goods.safeTransferFrom(
          traderB, trade.address, good3, traderBOptions,
        );
        await goods.safeTransferFrom(
          traderA, trade.address, good4, traderAOptions,
        );
      });

      it("correctly counts all goods", async () => {
        assert.equal(await goods.balanceOf(trade.address), 4);
        assert.equal(await goods.tokenOfOwnerByIndex(trade.address, 0), good1);
        assert.equal(await goods.tokenOfOwnerByIndex(trade.address, 1), good2);
        assert.equal(await goods.tokenOfOwnerByIndex(trade.address, 2), good3);
        assert.equal(await goods.tokenOfOwnerByIndex(trade.address, 3), good4);
      });

      it("refunds all goods on cancel", async () => {
        await trade.cancel(traderAOptions);
        assert.equal(await goods.ownerOf(good1), traderA);
        assert.equal(await goods.ownerOf(good2), traderB);
        assert.equal(await goods.ownerOf(good3), traderB);
        assert.equal(await goods.ownerOf(good4), traderA);
      });

      it("won't allow exchanging before finalization", async () => {
        await assertRejected(trade.getGoods(traderBOptions));
      });

      describe("and finalized", () => {
        beforeEach(async () => {
          await trade.accept(traderAOptions);
          await trade.accept(traderBOptions);
        });

        it("lets trader A get their goods", async () => {
          await trade.getGoods(traderAOptions);
          assert.equal(await goods.ownerOf(good1), trade.address);
          assert.equal(await goods.ownerOf(good2), traderA);
          assert.equal(await goods.ownerOf(good3), traderA);
          assert.equal(await goods.ownerOf(good4), trade.address);
          assert.isTrue(await trade.traderPulledGoods(traderA));
        });

        it("won't let trader A get their goods a second time", async () => {
          await trade.getGoods(traderAOptions);
          await assertRejected(trade.getGoods(traderAOptions));
        });

        it("lets trader B get their goods", async () => {
          await trade.getGoods(traderBOptions);
          assert.equal(await goods.ownerOf(good1), traderB);
          assert.equal(await goods.ownerOf(good2), trade.address);
          assert.equal(await goods.ownerOf(good3), trade.address);
          assert.equal(await goods.ownerOf(good4), traderB);
          assert.isTrue(await trade.traderPulledGoods(traderB));
        });

        it("won't let traders remove goods", async () => {
          await assertRejected(trade.removeGood(traderAOptions));
        });

        it("won't let traders add goods", async () => {
          await assertRejected(
            goods.safeTransferFrom(
              traderA, trade.address, good4, traderAOptions,
            ),
          );
        });
      });
    });
  });
});
