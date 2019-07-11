"use strict";

const shim = require('fabric-shim');
const util = require('util');

function getResult(s) {
	s = ("" + s + "").toString();
	return Buffer.from(s);
}

let Chaincode = class {
  async Init(stub) {
    return shim.success();
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    let method = this[ret.fcn];
    if (!method) {
	  const s1 = "Function ";
	  const s2 = ret.fcn;
	  const s3 = " not found";
	  const message_error = s1 + s2 + s3;
      throw new Error("  " + message_error + "  ");
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async initLedger(stub, args) {
    let DB = {
		beneficiary: [],
		visits: [],
	};
    await stub.putState('DB', Buffer.from(JSON.stringify(DB)));
    return getResult("INIT_DATABASE_OK");
  }
  
  async addRegularCheck(stub, args) {
	  const beneficiaryId = (args[0] + "").toString();
	  const date = (args[1] + "").toString();
		const location = (args[2]+""+args[3]+"").toString();
		const staff = (args[4]+""+args[5]+"").toString();
		const diagnosis = (args[6]+"").toString();


	  let value = await stub.getState('DB');
	  value = value.toString();
	  let DB = JSON.parse(value);
	  
	  let beneficiaryName = undefined;
	  
	  let beneficiaryAlreadyExists = false;
	  for(let i = 0; i < DB.beneficiary.length; i++) {
		const beneficiary = DB.beneficiary[i];
		if(beneficiary.beneficiaryId.toString() === beneficiaryId.toString()) {
			beneficiaryAlreadyExists = true;
			beneficiaryName = beneficiary.beneficiaryName.toString();
			break;
		}
	  }
	 
	  if(beneficiaryAlreadyExists === false) {
	 	 throw new Error("beneficiary_NOT_FOUND");
	  }
	 
	  let visit = {
	  	  beneficiaryId: beneficiaryId.toString(),
		  beneficiaryName: beneficiaryName.toString(),
		  date: date.toString(),
	  }
	 
	  DB.visits.push(visit);
	 
	  await stub.putState('DB', Buffer.from(JSON.stringify(DB)));
	 
	  return getResult("ADDING_visit_OK");
  }
  
  async hello(stub, args) {
	  return getResult("HELLO_FROM_MY_FABRIC");
  }
  
  async getAllRegularChecks(stub, args) {
	  let value = await stub.getState('DB');
	  value = value.toString();
	  let DB = JSON.parse(value);
	  
	  let visitsArr = DB.visits;
	  let visitsArrString = JSON.stringify();
	  return getResult(visitsArrString);
  }

  async addBeneficiary(stub, args) {
		const beneficiaryId = ((args[0] + "").toString());
		const beneficiaryName = (args[1] + " " + args[2]+ " " + args[3]).toString();
	    let value = await stub.getState('DB');
		value = value.toString();
		let DB = JSON.parse(value);
			
		let beneficiaryAlreadyExists = false;
		for(let i = 0; i < DB.beneficiary.length; i++) {
			const beneficiary = DB.beneficiary[i];
			if(beneficiary.beneficiaryId.toString() === beneficiaryId.toString()) {
				beneficiaryAlreadyExists = true;
				break;
			}
		}
			
		if(beneficiaryAlreadyExists === true) {
			throw new Error("beneficiary_ALREADY_EXISTS");
		}
		
		const beneficiary = {
			beneficiaryId: beneficiaryId.toString(),
			beneficiaryName: beneficiaryName.toString(),
		};
			
		DB.beneficiary.push(beneficiary);

		await stub.putState('DB', Buffer.from(JSON.stringify(DB)));
		
		return getResult("ADDING_beneficiary_OK");
  }
  
  async getAllbeneficiary(stub, args) {
	  let value = await stub.getState('DB');
	  value = value.toString();
	  let DB = JSON.parse(value);
	  
	  let beneficiaryArr = DB.beneficiary;
	  let beneficiaryArrString = JSON.stringify(beneficiaryArr);
	  return getResult(beneficiaryArrString);
  }

};

shim.start(new Chaincode());
