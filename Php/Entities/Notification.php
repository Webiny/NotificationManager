<?php
namespace Apps\NotificationManager\Php\Entities;

use Apps\Core\Php\DevTools\WebinyTrait;
use Apps\Core\Php\DevTools\Entity\AbstractEntity;
use Apps\Core\Php\DevTools\Exceptions\AppException;

/**
 * Class Notification
 *
 * @property string   $id
 * @property string   $title
 * @property string   $description
 * @property string   $slug
 * @property array    $labels
 * @property object   $email
 * @property Template $template
 *
 * @package Apps\Core\Php\Entities
 *
 */
class Notification extends AbstractEntity
{
    use WebinyTrait;

    protected static $entityCollection = 'NotificationManagerNotification';
    protected static $entityMask = '{title}';

    public function __construct()
    {
        parent::__construct();

        $this->attr('title')->char()->setValidators('required,unique')->setValidationMessages([
            'unique' => 'A notification with the same title already exists.'
        ])->setToArrayDefault()->onSet(function ($val) {
            $this->slug = $this->str($val)->slug()->val();

            return $val;
        })->setAfterPopulate(true);

        $this->attr('description')->char()->setToArrayDefault();
        $this->attr('slug')->char()->setToArrayDefault();
        $this->attr('labels')->arr()->setToArrayDefault();
        $this->attr('email')->object()->setToArrayDefault()->onSet(function ($val) {
            foreach ($val as $v) {
                $this->validateVariables($v);
            }
            $this->email = $val;

            return $val;
        })->setAfterPopulate(true);

        $template = 'Apps\NotificationManager\Php\Entities\Template';
        $this->attr('template')->many2one('Template')->setEntity($template);


        $this->api('post', 'preview/{notification}', function (Notification $notification) {
            return $this->preview($notification);
        });
    }

    public function preview(Notification $notification)
    {
        // we take the latest content from the post request
        $content = $this->wRequest()->getRequestData()['content'];

        // we take the template from the current notification
        $content = str_replace('{_content_}', $content, $notification->template->content);

        return ['email' => $this->wRequest()->getRequestData()['content']];
    }

    public function validateVariables($content)
    {
        // extract variables from the provided content
        $variables = $this->str($content)->match('\{.*?}');

        if ($variables && $variables->count() < 1) {
            return true;
        }

        // load all variables associated with this notification
        $assocVars = NotificationVariable::find(['notification' => $this->id]);

        $missingVars = [];
        foreach ($variables[0] as $v) {
            $found = false;
            $v = str_replace(['{', '}'], '', $v);
            foreach ($assocVars as $av) {
                if ($v == $av->key) {
                    $found = true;
                }
            }

            if (!$found) {
                $missingVars[] = $v;
            }
        }

        if (count($missingVars) > 0) {
            throw new AppException('One or more variables present in the email content are not defined in the variables list. (' . join(', ',
                    $missingVars) . ')');
        }

        return true;

    }


}