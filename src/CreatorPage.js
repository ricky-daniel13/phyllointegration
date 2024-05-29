import React, { useEffect, useRef, useState } from 'react';
import CreatorPicture from './CreatorPicture';
import CreatorInfo from './CreatorInfo'
import CreatorInfoLive from './CreatorInfoLive';
import Confetti from './Confetti';
import CreatorPieChart from './PieChart';

const CreatorPage = () => {
    const [showConfetti, setShowConfetti] = useState(false);
    const [userId, setUserId] = useState(false);
    const isGetting = useRef(false)

    const handleBookMeClick = () => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    };

    const userExternalId = "RicardoTest"

    const getAccountDemoData = async (accountId) => {
        const params = new URLSearchParams({
            account_id: accountId,
          });
        const demoQuery = await fetch(`https://api.staging.getphyllo.com/v1/audience?${params.toString()}`, {

                method: "GET", // *GET, POST, PUT, DELETE, etc.
                headers: {
                    "Authorization": `Basic ${process.env.REACT_APP_PHYLLO_KEY}`,
                },
                });

                console.log(demoQuery.status)
                if (demoQuery.status==200){
                    const demoData = await demoQuery.json()
                    console.log(demoData);
                }
    }

    const getAllDemoData = async (phylloId) => {
        const params = new URLSearchParams({
            user_id: phylloId,
          });
        const accountsQuery = await fetch(`https://api.staging.getphyllo.com/v1/accounts?${params.toString()}`, {

                method: "GET", // *GET, POST, PUT, DELETE, etc.
                headers: {
                    "Authorization": `Basic ${process.env.REACT_APP_PHYLLO_KEY}`,
                },
                });

                console.log(accountsQuery.status)
                if (accountsQuery.status==200){
                    const accountData = await accountsQuery.json()
                    console.log(accountData);
                    accountData.data.forEach(account => {
                        getAccountDemoData(account.id)
                    });
                }
    }

    useEffect(() => {
        if(isGetting.current)
            return;
        isGetting.current = true;

        const getBackendPhilloData = async () => {
            try {
                console.log("Getting response");
                console.log(process.env);

                let phylloId = null

                const userExistsQuery = await fetch(`https://api.staging.getphyllo.com/v1/users/external_id/${userExternalId}`, {
                method: "GET", // *GET, POST, PUT, DELETE, etc.
                headers: {
                    "Authorization": `Basic ${process.env.REACT_APP_PHYLLO_KEY}`,
                },
                });

                if (userExistsQuery.status==200){
                    const userData = await userExistsQuery.json()
                    console.log(userData);
                    phylloId=userData.id;
                }

                if (phylloId === null){
                    const userCreateQuery = await fetch("https://api.staging.getphyllo.com/v1/users", {
                    method: "POST", // *GET, POST, PUT, DELETE, etc.
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Basic ${process.env.REACT_APP_PHYLLO_KEY}`,
                    },
                    body: JSON.stringify({name: "RicardoTest", external_id: "RicardoTest"}), // body data type must match "Content-Type" header
                    });
                    console.log(userCreateQuery.status); // parses JSON response into native JavaScript objects
                    console.log(await userCreateQuery.json()); // parses JSON response into native JavaScript objects

                    if (userCreateQuery.status==201){
                        const userData = await userExistsQuery.json()
                        phylloId=userData.id;
                    } 
                }

                if (phylloId !== null){
                    const sdkTokenQuery = await fetch("https://api.staging.getphyllo.com/v1/sdk-tokens", {
                    method: "POST", // *GET, POST, PUT, DELETE, etc.
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Basic ${process.env.REACT_APP_PHYLLO_KEY}`,
                    },
                    body: JSON.stringify({
                        user_id: phylloId, 
                        products: ["IDENTITY",
                            "IDENTITY.AUDIENCE",
                            "ENGAGEMENT",
                            "ENGAGEMENT.AUDIENCE",
                            "INCOME",
                            "ACTIVITY"]}), // body data type must match "Content-Type" header
                    });

                    console.log(sdkTokenQuery.status); // parses JSON response into native JavaScript objects
                    const sdkQueryData = await sdkTokenQuery.json()
                    console.log(sdkQueryData); // parses JSON response into native JavaScript objects

                    if (sdkTokenQuery.status!=201){
                        return
                    } 

                    const token = sdkQueryData.sdk_token;

                    const config = {
                        clientDisplayName: "TCC", // the name of your app that you want the creators to see while granting access
                        environment: "staging", // the mode in which you want to use the SDK,  'sandbox' or 'production'
                        userId: phylloId, // the unique user_id parameter returned by Phyllo API when you create a user (see https://docs.getphyllo.com/docs/api-reference/reference/openapi.v1.yml/paths/~1v1~1users/post)
                        token: token
                    };
                
                    const phylloConnect = window.PhylloConnect.initialize(config);
                
                    phylloConnect.on("accountConnected", (accountId, workplatformId, userId) => {  // gives the successfully connected account ID and work platform ID for the given user ID
                        console.log(`onAccountConnected: ${accountId}, ${workplatformId}, ${userId}`);
                        getAllDemoData(phylloId);
                    })
                    phylloConnect.on("accountDisconnected", (accountId, workplatformId, userId) => {  // gives the successfully disconnected account ID and work platform ID for the given user ID
                        console.log(`onAccountDisconnected: ${accountId}, ${workplatformId}, ${userId}`);
                        getAllDemoData(phylloId);
                    })
                    phylloConnect.on("tokenExpired", (userId) => {  // gives the user ID for which the token has expired
                        console.log(`onTokenExpired: ${userId}`);  // the SDK closes automatically in case the token has expired, and you need to handle this by showing an appropriate UI and messaging to the users
                        getAllDemoData(phylloId);
                    })
                    phylloConnect.on("exit", (reason, userId) => {  // indicates that the user with given user ID has closed the SDK and gives an appropriate reason for it
                        console.log(`onExit: ${reason}, ${userId}`);
                        getAllDemoData(phylloId);
                    })
                    phylloConnect.on("connectionFailure", (reason, workplatformId, userId) => {  // optional, indicates that the user with given user ID has attempted connecting to the work platform but resulted in a failure and gives an appropriate reason for it
                        console.log(`onConnectionFailure: ${reason}, ${workplatformId}, ${userId}`);
                        getAllDemoData(phylloId);
                    })

                    phylloConnect.open();
                }
        
            } catch (error) {
                console.log(error); // parses JSON response into native JavaScript objects
            }
        }

        console.log("Loading");
        getBackendPhilloData();

    }, [])



    /*const config = {
        clientDisplayName: "TCC", // the name of your app that you want the creators to see while granting access
        environment: "staging", // the mode in which you want to use the SDK,  'sandbox' or 'production'
        userId: ""
        token: ""
    };

    const phylloConnect = PhylloConnect.initialize(config);

    phylloConnect.on("accountConnected", (accountId, workplatformId, userId) => {  // gives the successfully connected account ID and work platform ID for the given user ID
        console.log(`onAccountConnected: ${accountId}, ${workplatformId}, ${userId}`);
    })
    phylloConnect.on("accountDisconnected", (accountId, workplatformId, userId) => {  // gives the successfully disconnected account ID and work platform ID for the given user ID
        console.log(`onAccountDisconnected: ${accountId}, ${workplatformId}, ${userId}`);
    })
    phylloConnect.on("tokenExpired", (userId) => {  // gives the user ID for which the token has expired
        console.log(`onTokenExpired: ${userId}`);  // the SDK closes automatically in case the token has expired, and you need to handle this by showing an appropriate UI and messaging to the users
    })
    phylloConnect.on("exit", (reason, userId) => {  // indicates that the user with given user ID has closed the SDK and gives an appropriate reason for it
        console.log(`onExit: ${reason}, ${userId}`);
    })
    phylloConnect.on("connectionFailure", (reason, workplatformId, userId) => {  // optional, indicates that the user with given user ID has attempted connecting to the work platform but resulted in a failure and gives an appropriate reason for it
        console.log(`onConnectionFailure: ${reason}, ${workplatformId}, ${userId}`);
    })*/

    return (
        <div className="creator-page">
            {showConfetti && <Confetti show={showConfetti} />}
            <header className="creator-header">
                <h1>John Doe's Creator Page</h1>
            </header>
            <div className="creator-content">
                <CreatorPicture />
                <CreatorInfo />
                <CreatorInfoLive />
            </div>
            <div className="creator-chart-container">
                <div className="creator-chart">
                    <CreatorPieChart />
                </div>
                <p className="creator-chart-text">Percentage of following in different ranges</p>
            </div>
            <button className="book-me-button" onClick={handleBookMeClick}>
                Book Me
            </button>
        </div>
    );
};

export default CreatorPage;
