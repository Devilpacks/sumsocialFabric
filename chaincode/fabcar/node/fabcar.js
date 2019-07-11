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

  // функция для приема и вызова метода класса
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

  // метод для получения массива ключей
  async getKeysArr(stub, args) {
	  // из блокчейна беру массив ключей в виде байтовой строки
	  const arrBuffer = await stub.getState("ARR");
	  // преобразую байтовую строку в обычную строку
	  const arrString = arrBuffer.toString();
	  // отправляю массив в формате JSON клиенту
	  return getResult(arrString);
  }


  async getKeyValue(stub, args) {
    // получаю ключ и преобразую в обычную строку
    const key = (args[0] + "").toString();
    // из блокчейна беру массив ключей в виде байтовой строки
    const arrBuffer = await stub.getState("ARR");
    // преобразую байтовую строку в обычную строку
    let arrString = arrBuffer.toString();
    // преобразую строку в массив
    const arr = JSON.parse(arrString);
    // ищу наличие ключа в массиве ключей
    for (let i = 0; i < arr.length; i++) {
      // если совпадение найдено
      if (arr[i] === key) {
        // get value from blockchain
        const value = await stub.getState(key);
        return getResult(value);
      };
    };
    // генерирую ошибку и завершаю работу программы
    throw new Error("KEY_IS_NOT_FOUND");
  };


  // инициализация
  async initLedger(stub, args) {
	  // создаем пустой массив ключей
	  const arr = [];
	  // преобразуем массив в строку
	  const arrString = JSON.stringify(arr);
	  // сохраняем массив в формате байтовой строки в блокчейе
	  await stub.putState('ARR', Buffer.from(arrString));
	  // отправляем ответ клиенту об успешном создании массива ключей
	  return getResult("CREATE_EMPTY_ARRAY_OF_KEYS_OK");
  }
  
  // добавление осмотра в блокчейн и контроль существования бенефициара
  async addRegularCheck(stub, args) {
	  // получаю ключ и преобразую в обычную строку
	  const key = (args[0] + "").toString();
	  // получаю осмотр и преобразую в обычную строку
		const checkString = (args[1] + "").toString();
		// получаю осмотр и преобразую в JSON объект
		//const cheks = JSON.parse(checkString);

	  // из блокчейна беру массив ключей в виде байтовой строки
	  const arrBuffer = await stub.getState("ARR");
	  // преобразую байтовую строку в обычную строку
	  let arrString = arrBuffer.toString();
	  // преобразую строку в массив
	  const arr = JSON.parse(arrString);

	  // ищу наличие ключа в массиве ключей
	  for(let i = 0; i < arr.length; i++) {
		  // если совпадение найдено
		  if(arr[i] === key) {
				// из блокчейна беру массив осмотров по ключу в виде байтовой строки
				const valueBuffer = await stub.getState(key);
				let valueString = valueBuffer.toString();
				// добавляем в value значения повторного осмотра
				
				//const value = JSON.parse(valueString);

				//const value = JSON.parse(value);
				const addCheck = valueString + ", " + checkString;
				//checks.push(checkString)
				await stub.putState(key, Buffer.from(addCheck));
				// возращаем ответ об успешном добавлении осмотра
				//return getResult("CREATE_NEW_CHECK_OK");
				return getResult("valueBuffer: " + valueBuffer + " checkString: " + checkString);
		  }
	  }

	  // если мы дошли до этого места
	  // то совпадения ключей НЕ было

	  throw new Error("BENEFICIARY_NOT_EXISTS");
	}


	// добавление бенефициара
	async addBeneficiary(stub, args) {
		 // получаю ключ и преобразую в обычную строку
		const key = (args[0] + "").toString();
		 // получаю фио бенефициара и преобразую в обычную строку
		const nameString = (args[1] + "").toString();

		// из блокчейна беру массив ключей в виде байтовой строки
		const arrBuffer = await stub.getState("ARR");
		// преобразую байтовую строку в обычную строку
		let arrString = arrBuffer.toString();
		// преобразую строку в массив
		const arr = JSON.parse(arrString);
		
		// ищу наличие ключа в массиве ключей
		for(let i = 0; i < arr.length; i++) {
			// если совпадение найдено
			if(arr[i] === key) {
			// возращаем ошибку о наличии бенефициара с таким id
				throw new Error("BENEFICIARY_ALREADY_EXISTS");
			}
		}

		// добавляем ключ к концу массива
		arr.push(key);
	  // преобразуем изменненый массив ключей в строку формата JSON
		arrString = JSON.stringify(arr);
		
	  // кладем изменный массив в формате байтовой строки в блокчейн
		await stub.putState('ARR', Buffer.from(arrString));
		
	  // кладем бенефициара с его ключем в блокчей в формате строки байт
	  await stub.putState(key, Buffer.from(nameString));

	  // возвращаем ответ об успешной вставке бенефициара
		return getResult("CREATE_NEW_BENEFICIARY_OK");
	
  }
  
};

shim.start(new Chaincode());
