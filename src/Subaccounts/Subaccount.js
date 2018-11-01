class Subaccount{
  constructor(id, secretKey, designerKey, publicKey, name, email, active){
    this.id = id;
    this.secretKey = secretKey;
    this.designerKey = designerKey;
    this.publicKey = publicKey;
    if(name !== null){
      this.name = name;
    }
    this.email = email;
    this.active = active;
  }
}

module.exports = Subaccount;
