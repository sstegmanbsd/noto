<h1 align="center">✨ Noto</h1>
<p align="center"><sup>(/nōto/, <em>notebook</em> in Japanese)</sup></p>
<p align="center">Generate clean commit messages in a snap! ✨</p>

<pre align="center">
  <p>npm install -g <b>@snelusha/noto</b></p>
</pre>

## Features

- **Instant Commit Messages**: Generate clear, context-aware messages based on staged changes.

- **Seamless Git Integration**: Apply messages directly, skip the copy-paste.

- **No Installation Required:** Use instantly with `npx @snelusha/noto` — just run and go!

## Getting Started

1. **Configuration:**
   Before diving in, run the following command to configure your `noto`:

   ```bash
   noto config
   ```

Here, you’ll need to input your Google GenAI API Key.

2. **Generate commit messages**
   To generate a commit message, simply run:

   ```bash
   noto                 # generate a commit message

   # apply generated message
   noto --apply         # apply the message to current commit
   noto -a              # alias for apply 

   # copy generated message
   noto --copy          # copy the message to clipboard
   noto -c              # alias for copy

   # access the previously generated message
   noto prev            # view the last message

   noto prev --apply    # apply the last message to current commit
   noto prev -a         # alias for apply

   noto prev --copy     # copy the last message to clipboard
   noto prev -c         # alias for copy
   ```

## Pro Tips

- 🚀 Get fast commits on the fly with `noto -a` to streamline your workflow!

## Contributing

We welcome contributions and suggestions! If you have ideas or improvements, feel free to reach out or open a pull request.

Thank you for using `noto`! If you have any feedback or suggestions, feel free to reach out or contribute to the project. ✨

## License

This project is licensed under the MIT License.
© 2024 [Sithija Nelusha Silva](https://github.com/snelusha)
