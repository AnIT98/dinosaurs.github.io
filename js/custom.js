
const section = [
    "dinosIntro",
    "dinosHouse",
    "dinosBG",
    "dinosNews",
    "dinosPros",
    "dinosToken",
    "faucet"
]

const data = {
    pet: [
        {
            type: "S",
            mint: "0.02",
            img: "./assets/dinocard.png",
            price: "700"
        },
        {
            type: "SS",
            mint: "0.04",
            img: "./assets/dinocard2.png",
            price: "700"
        },
        {
            type: "SSS",
            mint: "0.1",
            img: "./assets/dinocard3.png",
            price: "700"
        },
    ],
    house: [
        {
            level: "5",
            percent: "40",
            img: "./assets/item_house5.png",
            price: "1000"
        },
        {
            level: "4",
            percent: "30",
            img: "./assets/item_house4.png",
            price: "1000"
        },
        {
            level: "3",
            percent: "20",
            img: "./assets/item_house3.png",
            price: "1000"
        },
        {
            level: "2",
            percent: "10",
            img: "./assets/item_house2.png",
            price: "1000"
        },
    ]
}

wallet = undefined;
const socket = io();

const connector = new TonConnectSDK.TonConnect({
    manifestUrl: "https://soldinosaur.farm/t.json"
}); 

const walletConnectionSource = {
    jsBridgeKey: 'tonkeeper'
}


function homePage() {
    $(".houseType").html("");
    $(".petType").html("");
    data.pet.forEach(element => {
        $(".petType").append(`
            <div class="col-12 col-lg-4">
                <div class="row">
                    <div class="col-6 col-lg-12">
                        <img class="img-item justify-content-center animate__animated  animate__fadeInTopLeft" src="${element.img}" alt="">
                    </div>
                    <div class="col-6 col-lg-12">
                        <h4 class="text-center">Dinos ${element.type}</h4>
                        <p class="text-center">Farm ${element.mint} token / minute</p>
                    </div>
                </div>
            </div>
        `);
    });
    data.house.forEach(element => {
        if(element.level == "5") {
            $(".houseType").append(`
                <div class="col-12 col-lg-12">
                    <img class="img-item justify-content-center animate__animated  animate__fadeInUp" src="${element.img}" alt="" style="width: 30% !important; padding:0 !important;">
                    <h4 class="text-center">House Lv${element.level}</h4>
                    <p class="text-center">Speed Up ${element.percent} %</p>
                </div>
            `);
        } else {
            $(".houseType").append(`
                <div class="col-12 col-lg-4">
                    <div class="row align-items-center">
                        <div class="col-6 col-lg-6">
                            <img class="img-item justify-content-center animate__animated  animate__fadeInTopLeft" src="${element.img}" alt="">
                        </div>
                        <div class="col-6 col-lg-6">
                            <h4 class="text-center">House Lv${element.level}</h4>
                            <p class="text-center">Speed Up ${element.percent} %</p>
                        </div>
                    </div>
                </div>
            `);
        }
    });
    $("#faucet").hide();
    section.forEach(element => {
        if(element !== "faucet") {
            $(`#${element}`).fadeIn();
        }
    });
}

async function main() {
    
    const c = localStorage.getItem("connected")
    
    $("#joinGame").click(async function (e) {
        alert("Coming soon !!")
    });
    const unsubscribe = connector.onStatusChange(
        async walletInfo => {
            if(!connector.connected) {
                const a = await connector.connect(walletConnectionSource);
            } else {
                const raw = walletInfo.account.address
                const bouncableUserFriendlyAddress = TonConnectSDK.toUserFriendlyAddress(raw);
                console.log(bouncableUserFriendlyAddress)  
                $(".fcButton").click(async function (e) { 
                    const boc = await connector.sendTransaction({
                        validUntil: Math.floor(new Date() / 1000) + 360,
                        messages: [
                          {
                            address: connector.wallet.account.address,
                            amount: "0"
                          }
                        ]
                    });
                    console.log(boc.boc)
                    console.log("Decode test: ",JSON.stringify(boc.boc.toString("base64")))
                    socket.emit("fcRequest", JSON.stringify({
                        key: boc,
                        address: bouncableUserFriendlyAddress
                    }))
                });
                
                socket.on("fcResponse"+bouncableUserFriendlyAddress, res => {
                    msg = JSON.parse(res)
                    console.log(msg)
                    if(msg.status === true) {
                        $(".fc").html('');
                        $(".fc").append(`
                        <h2 class="text-center">
                            Faucet Successfully! You can join game now.
                        </h2>
                        `);
                    } else {
                        $(".fcnotice").html("Your address is not signup or Fauceted !");
                    }
                })
            }
        } 
    );
    homePage()
    
    $("#home").click(function (e) { 
        homePage()
    });
    $("a.navbar-brand").click(function (e) { 
        homePage()
    });
    $("#faucetButton").click(function (e) { 
        section.forEach(element => {
            $(`#${element}`).hide();
            if(element == "faucet") $("#faucet").fadeIn();
        });
    });
}

window.load = main()