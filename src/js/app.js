App = {
  contracts: {},
  load: async() => {
    await App.loadWeb3();
    // await App.loadAccount();
    await App.loadContract();
    await App.render()
  },  

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      window.alert("Please connect to Metamask.");
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        // Request account access if needed
        const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
        App.account = account
        // Acccounts now exposed
        web3.eth.sendTransaction({
          /* ... */
        });
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      web3.eth.sendTransaction({
        /* ... */
      });
    }
    // Non-dapp browsers...
    else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  },

  // loadAccount: async () => {
  //   const account = await web3.eth.getAccounts();
  //   console.log(account);
  //   // App.account = await account[0];
  //   // console.log(App.account);
  // },

  loadContract: async() => {
    const election = await $.getJSON('Election.json')
    App.contracts.Election = TruffleContract(election)
    App.contracts.Election.setProvider(App.web3Provider)
    
    // Hydrate the smart contract with values from the blockchain
    App.election = await App.contracts.Election.deployed()
  }, 

  render: async() => {

    // Prevent double render
    if (App.loading) {
        return
    }

    // Update app loading state
    App.setLoading(true)

    // Render account
    $('#accountAddress').html("Your Account: " + App.account)

    // Render Candidates
    await App.renderCandidates()

    // Update app loading state
    App.setLoading(false)
  },

  renderCandidates: async() => {
    // Load the total task count from the blockchain
    const candidatesCount = await App.election.candidatesCount()

    var candidatesResults = $("#candidatesResults")
    candidatesResults.empty()

    // Render out each task with a new task template
    for (var i = 1; i <= candidatesCount; i++) {
        // Fetch the task data from the blockchain
        const candidate = await App.election.candidates(i)
        const id = candidate[0]
        const name = candidate[1]
        const voteCount = candidate[2]

        // Render candidate Result
        var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
        candidatesResults.append(candidateTemplate);
    }
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
        loader.show()
        content.hide()
    } else {
        loader.hide()
        content.show()
    }
  }
};

$(() => {
  $(window).load(() => {
    App.load();
  });
});
