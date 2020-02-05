<script>
    import { map } from 'ramda';

    let text = 'Hello there';

    const numbers = map(x => x * 2, [1, 2, 3]);

    console.log(text, numbers);
</script>

<div>{text}</div>
