import Vuex from "vuex";
import { dapp } from "@/lib/dapp";

const localStorage = window.localStorage;

let token;

const createStore = () => {
  return new Vuex.Store({
    state: {
      dappInit: false,
      isMintOwner: false,
      items: [],
      friends: [],
    },
    mutations: {
      ["dapp/initialized"](state, isInit) {
        state.dappInit = isInit;
      },
      ["isMintOwner"](state, isMintOwner) {
        state.isMintOwner = isMintOwner;
      },
      ["items"](state, items) {
        state.items = items;
      },
      ["friends"](state, friends) {
        state.friends = friends;
      },
    },
    actions: {
      getFriendList(context) {
        const friends = JSON.parse(localStorage.getItem("friends"));
        context.commit("friends", friends);
      },
      setFriendList(context) {
        localStorage.setItem("friends", JSON.stringify(context.state.friends));
      },
      async getItems(context) {
        const items = [
          1, 2, 3,
        ];
        context.commit("items", items);
      },
      createToken() {
        dapp.deployContract(dapp.contracts.MintableERC721);
      },
      tokenCreated(context, contract) {
        alert(`contract created ${contract}`);

        //TODO :: commit something to the store
        context.commit("");
      },

      async transferToken(context) {
        const receiverAddress = "0x0";
        const tokenID = "0";
        await token.methods.approve(receiverAddress, tokenID);
        await token.methods.transferFrom(
          this.dapp.defaultAccount,
          receiverAddress,
          tokenID,
        );

        //TODO :: commit something to the store
        context.commit("");
        context.dispatch("getItems");
      },

      async checkMintOwner(context) {
        token = dapp.getContractAt(
          dapp.contracts.MintableERC721,
          "0xDB2E91f83cA869421d22E795a86b623a24c03edB"
        );
        const ownerAddress = await token.methods.owner().call();
        const isOwner = ownerAddress == dapp.defaultAccount;
        context.commit("isMintOwner", isOwner);
      },

      async mintToken(context, { receiverAddress, tokenID }) {
        await token.methods.mint(receiverAddress, tokenID).send();

        //TODO :: commit something to the store
        context.commit("");
      },

    },
  });
};
export default createStore;
