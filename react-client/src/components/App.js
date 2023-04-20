import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './Navigation';
import Chat from './Chat';
import Page from './Page';
import CsvContainer from './CsvContainer';
import '../styles.css';


function App() {
  // global state
  const INIT_APP_STATE = {
    pagesById: {
      "contacts": {
        title: "Contacts",
        emoji: "👥",
        text: "",
        csv: {
          rawText: "This is contacts",
        },
        chat: {
          messages: [
            {
              img: "open.png",
              prompt: "Hi there. Ask me questions about your contacts data.",
            },
          ]  
        },
        isExpanded: false,
        parent: ""
      },
      "quotes": {
        title: "Quotes",
        emoji: "✌️",
        text: "",
        csv: {
          rawText: "This is quotes",
        },
        chat: {
          messages: [
            {
              img: "open.png",
              prompt: "Hi there. Ask me questions about your quotes data.",
            },
          ]  
        },
        isExpanded: false,
        parent: ""
      },
      "orders": {
        title: "Orders",
        emoji: "📦",
        text: "",
        csv: {
          rawText: `Customer,Buyer,PO,date,quantity,part number,revision,description,price,amount,notes,notes1,quantity due,due date
          "Haas Automation, Inc.",GREGG MESLER,4500860667,2/22/23,120,20-8513,G,NUT AIR CYLINDER,17.8,2136,,,120,5/18/23
          "Haas Automation, Inc.",BRYAN RUBERTI,4500860388,2/22/23,40,20-1454A,A,ENCODER PULLEY MOUNT,38.32,1532.8,,,40,4/11/23
          "Haas Automation, Inc.",BRYAN RUBERTI,4500860428,2/22/23,100,20-8518,B,RETAINER SPRINGS T/C SL-20,24.78,2478,,,100,5/4/23
          "Haas Automation, Inc.",GREGG MESLER,4500860607,2/22/23,50,20-8520,G,HOUSING AIR CYLINDER T/C,56.8,2840,,,50,6/2/23
          "Haas Automation, Inc.",GREGG MESLER,4500860188,2/22/23,30,20-4329B,B,PILOT SUPPORT,66.8,2004,,,30,5/2/23
          "Haas Automation, Inc.",GREGG MESLER,4500860205,2/22/23,100,20-7657,A,LOCKING DRIVEN PULEY TRT160,19.61,1961,,,100,4/30/23
          Replacement Parts Industries,ELIZABETH BARCENAS,67870,2/28/23,300,ADK170A,D,BLOCK,47.75,14325,CERTIFICATE OF CONFORMANCE REQUIRED,CERTIFICATE OF CONFORMANCE REQUIRED,100,5/1/23
          ,,,,,,,,,,,,100,8/1/23
          ,,,,,,,,,,,,100,11/1/23
          "NEA ELECTRONICS, INC.",Deborah Andrade,106427,2/28/23,2000,7003111,C,"CONTACT, TERMINAL",7.25,14500,"INSPECT FOR FOD, BURRS AND PLATING WORKMANSHIP ON 100% OF SAMPLES (PER EMAIL/DEBORAH)THE FOLLOWING EBAD SPECIAL QUALITY CLAUSES APPLY TO THIS LINE ITEM (REFERENCE ADPUR-04, REV Y) CLAUSE 11, 129, 29, 5B, 6, 7, 8BPO 106427: QC 29 (SINGLE LOT REQUIREMENT) IS NOT APPLICABLE.","**VERY IMPORTANT REF 016-E0000-5110-0000 IN REFERENCE SECTION OF THE SHIPPING WAYBILLPO NO. MUST APPEAR ON EACH PACKAGE PACKING LIST, BILL OF LADING, AND INVOICENEA FEDEX ACCT# 221640314",2000,4/28/23
          Replacement Parts Industries,ELIZABETH BARCENAS,67872,3/2/23,325,TUH032A,A,SAFETY VALVE HOLDER BODY,12.67,4117.75,CERTIFICATE OF CONFORMANCE REQUIRED,CERTIFICATE OF CONFORMANCE REQUIRED,150,4/3/23
          ,,,,,,,,,,,,175,8/1/23
          Replacement Parts Industries,ELIZABETH BARCENAS,67872,3/2/23,200,MIK189A,B,ACTUATOR CAP,18.79,3758,CERTIFICATE OF CONFORMANCE REQUIRED,CERTIFICATE OF CONFORMANCE REQUIRED,100,4/3/23
          ,,,,,,,,,,,,100,8/1/23
          "Haas Automation, Inc.",GREGG MESLER,4500863044,3/2/23,85,20-8516,D,LEVER CAM T/C,14.43,1226.55,,,85,5/11/23
          HILZ Cable Assemblies Inc.,TARA,3323PM-SKM,3/3/23,3500,20-5720,B,TEMP SENSOR HOUSING,2.44,8540,PARTIALS OK TO SEND,,3500,3/24/23
          "Haas Automation, Inc.",GREGG MESLER,4500863268,3/6/23,60,20-4070,C,AC125 SLIP RING,23.35,1401,,,60,5/23/23
          Aero Engineering & Mfg. Co.,Ryan Statti,90453-13-D,3/8/23,50,817480-5,C,MCHF FITTING,59,2950,"3/8: REC'D MAT FROM AEROOP 030:MACHINE MILL OP.1:CLEVIS WIDTH .760"", .3125""/.3145""DIA, .101""/.106""DIA, .380"", .75"", & DEBURR PER DWG. & STP51-400E / E V02NOTE:1) CLEVIS WIDTH (NOT SHOWN) IS .880"" +/-.010"" PER LS7267 DWG.2) THE CORNER RADIUS AT THE BOTTOM OF THE CLEVIS (NO SHOWN) IS .125""R3) No Grinding Allowed OP 040:MACHINE LATHE OP.1:TURN THREADED END COMPLETE & DEBURR PER DWG & STP51-400E / E V02NOTE:1) HOLD THREAD PITCH DIA. TO .3442""/.3463"" FOR CAD PLATE OP 050:MACHINE MILL OP.2:.500"", .380"", 1.260"", .06""/.09"" R, PER DWG. & STP51-400E / E V02 OP 060:DEBURR PARTS COMPLETE. ALL SHARP EDGES TO BE BROKEN .005""-.03"", AT THE EDGE BREAKING LOCATION, OR UP TO 30% OF PART THICKNESS, WHICH EVER IS SMALLER, AS REQUIRED, PER DWG. & STP51-400E / E V02AERO ENG TO SUPPLY:4340 1.0""DIA HEAT TREATED TO 180/200 KSI 50 each SAW CUT TO 2.68"" LONGAIRCRAFT: P-3***END***",,50,4/7/23
          "Haas Automation, Inc.",BRYAN RUBERTI,4500863921,3/8/23,80,20-9597,B,TURRET COOLANT NOZZLE HOUSING BMT45,16.63,1330.4,,,80,5/5/23
          "Haas Automation, Inc.",BRYAN RUBERTI,4500864011,3/9/23,200,20-0523,A,3/4-14 NPTF (TANK) TO 9/16-18 STRAIGH,10.95,2190,This is the Parker part number linked to 20-0523 / 6-12 F5OF-S 974481,,200,4/28/23
          "Haas Automation, Inc.",GREGG MESLER,4500864171,3/10/23,200,20-1925,B,COUPLING CONVEYOR MOTOR MINIMILL,32.94,6588,9/18 TO 9/26... 9/26/229/8 TO 9/18...8/28/22,,200,5/11/23
          "Haas Automation, Inc.",GREGG MESLER,4500864278,3/10/23,50,20-0168B,D,SHAFT LT HARDENED,38.7,1935,,,50,5/25/23
          "Haas Automation, Inc.",GREGG MESLER,4500864525,3/13/23,25,15-6807,B,BMT LT INDICATOR HOLDER,74.95,1873.75,,,25,6/8/23
          "Crissair, Inc.",George Jauss,PO211410-1,3/14/23,6000,0911-33382,C,OUTSIDE MACHINE - LESS MATERIAL AND OSP ,6.37,38220,"3/15: REC'D MATERIALNO PAPER3/14: REC'D MATERIAL1/2"" RD 12L1419"", 1512"", 4896""MANUFACTURE COMPLETE PER CRISSAIR PRINT USING DOMESTIC OR DFAR MATERIAL ONLYPARTS MUST BE BURR FREE AND WILL BE INSPECTED PER CRISSAIR WORKMANSHIP STANDARDS - WI 3200.01.ON ORDERS THAT ARE 100 PCS OR MORE, PLEASE REQUEST PLASTIC TRAYS FROM YOUR BUYER",QUOTE# 14697,6000,4/27/23
          "Haas Automation, Inc.",GREGG MESLER,4500864544,3/14/23,250,20-8403,A,COVER WORM TRT210 2020 ,9.26,2315,,,250,6/23/23
          "Crissair, Inc.",Edward Pinto,PO211600-1,3/15/23,11000,O911-32041,G,OUTSIDE MACHINE - LESS MATERIAL,3.78,41580,"MANUFACTURE COMPLETE PER CRISSAIR PRINT USING DOMESTIC OR DFAR MATERIAL ONLYPARTS MUST BE BURR FREE AND WILL BE INSPECTED PER CRISSAIR WORKMANSHIP STANDARDS - WI 3200.01.ON ORDERS THAT ARE 100 PCS OR MORE, PLEASE REQUEST PLASTIC TRAYS FROM YOUR BUYER",3/21: Return gages with parts,11000,3/28/25
          "Crissair, Inc.",Edward Pinto,PO211601-1,3/15/23,8000,O911-32011,J,OUTSIDE MACHINE - LESS MATERIAL,5.2,41600,"MANUFACTURE COMPLETE PER CRISSAIR PRINT USING DOMESTIC OR DFAR MATERIAL ONLYPARTS MUST BE BURR FREE AND WILL BE INSPECTED PER CRISSAIR WORKMANSHIP STANDARDS - WI 3200.01.ON ORDERS THAT ARE 100 PCS OR MORE, PLEASE REQUEST PLASTIC TRAYS FROM YOUR BUYER",3/21: Return gages with parts,8000,3/28/25
          "Crissair, Inc.",Edward Pinto,PO211602-1,3/15/23,4000,O911-32002,H,OUTSIDE MACHINE - LESS MATERIAL,3.78,15120,"MANUFACTURE COMPLETE PER CRISSAIR PRINT USING DOMESTIC OR DFAR MATERIAL ONLYPARTS MUST BE BURR FREE AND WILL BE INSPECTED PER CRISSAIR WORKMANSHIP STANDARDS - WI 3200.01.ON ORDERS THAT ARE 100 PCS OR MORE, PLEASE REQUEST PLASTIC TRAYS FROM YOUR BUYER",3/21: Return gages with parts,4000,3/28/25
          "ROBERTS TOOL COMPANY, INC.",Araceli Alcaraz,0220519-00,3/15/23,350,2671351-1,J,POPPET,8.9,3115,"MACHINE 2671351-1 POPPET COMPLETE PER B/P LESS PROCESSINGPART MATERIAL 6061-T6 OR -T651 AL PER AMS-QQ-A-225/8, OR 6061-T6, OR -T6510, OR -T6511 AL PER AMS-QQ-A-200. DOMESTIC MATERIAL ONLY***END***",,350,5/5/23
          Aero Engineering & Mfg. Co.,Ryan Statti,90669-B,3/15/23,10,4G53712-101A,E,MCHF NUT,186.67,1866.7,"OP: 010MACHINE COMPLETE PER DWG. & STP51-400EEXCEPT:1)  LESS THE THREADS2)  HOLD ID TO 3.335/3.345 DIA3)  TOLERANCE FOR 4.000 HEX STOCK SIZE TO BE +.000/-.006OP: 020DEBURR PARTS COMPLETE. ALL SHARP EDGES TO BE BROKEN .005""-.03"", AT THE EDGE BREAKING LOCATION, OR UP TO 30% OF PART THICKNESS, WHICH EVER IS SMALLER, AS REQUIRED, PER DWG. & STP51-400E / E V02AERO ENG. TO SUPPLY VIA DROP SHIP:4340 5.25"" DIA COND C PER AMS6415V 1 @ 3FTEMAIL CERTS/PACKING SLIP FOR APPROVAL TO CHRISTINE.CABRERA@AEROENG.COM PRIOR TO PROODUCTION***END***",,10,4/25/23
          "Haas Automation, Inc.",GREGG MESLER,4500864997,3/20/23,200,20-1939A,C,T/S DRIVE SCREW TL-1,23.6,4720,28/BXPACK TO PROTECT,,200,6/2/23
          "Haas Automation, Inc.",BRYAN RUBERTI,4500864876,3/20/23,120,20-6830,B,BAR FEED PUSH ROD 3/8 DIA SOLID,22.97,2756.4,,,120,5/26/23
          "Haas Automation, Inc.",GREGG MESLER,4500865612,3/21/23,120,20-1046,B,BUSHING 3/4 PUSHER SHAFT,8.7,1044,,,120,6/8/23
          "Haas Automation, Inc.",GREGG MESLER,4500865279,3/21/23,500,20-9211,E,NUT HOUSING 40MM BSCREW,10.38,5190,,,500,6/14/23`,
        },
        chat: {
          messages: [
            {
              img: "open.png",
              prompt: "Hi there. Ask me questions about your orders data.",
            },
          ]  
        },
        isExpanded: false,
        parent: ""
      },
      "invoices": {
        title: "Invoices",
        emoji: "📄",
        text: "",
        csv: {
          rawText: "This is invoices",
        },
        chat: {
          messages: [
            {
              img: "open.png",
              prompt: "Hi there. Ask me questions about your invoices data.",
            },
          ]  
        },
        isExpanded: false,
        parent: ""
      },
      "purchasing": {
        title: "Purchasing",
        emoji: "💸",
        text: "",
        csv: {
          rawText: "This is purchasing",
        },
        chat: {
          messages: [
            {
              img: "open.png",
              prompt: "Hi there. Ask me questions about your purchasing data.",
            },
          ]  
        },
        isExpanded: false,
        parent: ""
      }
    },
    pageIds: ["contacts", "quotes", "orders", "invoices", "purchasing"],
    activePageId: "contacts", // Include an activePageId too
  }
  const [appState, setAppState] = useState(INIT_APP_STATE);
  

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Navigation appState={appState} />
          <Routes>
            {Object.keys(appState.pagesById).map((pageId) => {
              return (
                <Route
                  path={`/${pageId}/*`}
                  element={
                    <Page
                      key={pageId} // Add the key prop here
                      pageId={pageId}
                      appState={appState}
                      setAppState={setAppState}
                    />
                  }
                />    
              )
            })}
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;