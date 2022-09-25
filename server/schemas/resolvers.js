const { AuthenticationError } = require("apollo-server-express");
const { User, Book } = require('../models');
const { signToken } = require("../utils/auth");


//functions for queries in typeDef.js
const resolvers = {
  Query: {
    // when we add context to the query, then i can retrieve the logged in user without have to specififally look for it.
    me: async (parent, args, context) => {
      //if context has an 'user property' then it means that the user excecuting this query has a valid JWT and is already logged in
      if(context.user) {
        const userData = await User.findOne({
          _id:context.user._id
        })
        .select("-__v -password");
        const userPopulate = await userData.populate("savedBooks").execPopulate();
        console.log("me query: ", userPopulate)
        return userData;
      }
      throw new AuthenticationError("User is not logged in")
    },
    // findBook: async (parent, {args, context}) => {
    //   //if context has an 'user property' then it means that the user excecuting this query has a valid JWT and is already logged in
    //   if(context.savedBook) {
    //     const bookData = await Book.findOne({
    //       title: context.savedBooks.title
    //     }).populate("savedBooks");
    //     return bookData;
    //   }
    //   throw new AuthenticationError("User is not logged in")
    // },
  },
  Mutation: {
    //creates a single user an a jwt token for that user
    addUser: async (parent, args) => {
      try {
        //create a new user first
        const user = await User.create(args);
        //sign a JSON web token and log in the user after it is created
        const token = signToken(user);
        //we need to return an 'auth' object that contains the signed token and user's info
        return { token, user };
      } catch (err) {
        console.log(err);
      }
    },
    //login mutation to find a specific user by email in the db
    login: async (parent, { email, password }) => {
      //look for the user by the email which has to be unique
      const user = await User.findOne({ email });
      //if there is no user with that email address then i need to return a authentication error
      if (!user) {
        throw new AuthenticationError("No user was found");
      }
      //if the user was found, then we need to excecute the 'isCorrectPassword' instance method and check if the password is correct
      const correctPw = await user.isCorrectPassword(password);
      //if the password is not correct then return authentication error
      if(!correctPw) {
        throw new AuthenticationError("Incorrect password");
      }
      //if email and password are correct, then sign the yser into the app with a jwt
      const token = signToken(user);
      return { token, user };
    },
    //when we add context to the query, then i can retrieve the logged in user without have to specififally look for it.
  removeBook: async (parent, {bookId}, context) => {
    //if context has an 'user property' then it means that the user excecuting this query has a valid JWT and is already logged in
    if(context.user) {
      const updatedUser = await User.findOneAndUpdate({
        _id:context.user._id
      },
      //delete the book based on the book ID from the db
      { $pull: { savedBooks: { bookId: bookId} } },
      { new: true }
      );
      return updatedUser;
    }
    //if usert attempts to execute this update mutation and it is not logged in, then I need to throw an error
    throw new AuthenticationError("User is not logged in");
  },
   // when we add context to the query, then i can retrieve the logged in user without have to specififally look for it.
    saveBook: async (parent, { dataBook }, context) => {
    //if context has an 'user property' then it means that the user excecuting this query has a valid JWT and is already logged in
    if(context.user) {
      const updatedUser = await User.findOneAndUpdate({
        _id:context.user._id
      },
      //push the book to an array of books associated with this user
      { $addToSet: { savedBooks: dataBook} },
      { new: true
      // runValidators: true 
    }
      );
      return updatedUser;
    }
    //if usert attempts to execute this update mutation and it is not logged in, then I need to throw an error
    throw new AuthenticationError("User is not logged in");
  },
  
  },
 

};

module.exports = resolvers;
